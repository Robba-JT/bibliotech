var Q = require("q"),
    _ = require("lodash"),
    ObjectID = require("mongodb").ObjectID,
    db = require("../db/database").client,
    UsersAPI = require("../db/users").UsersAPI,
    BooksAPI = require("../db/books").BooksAPI,
    mailAPI = require("../tools/mails").MailsAPI;

module.exports = function main (socket) {
    "use strict";

    var client = socket.request.client,
        userAPI = new UsersAPI(db),
        bookAPI = new BooksAPI(db, client),
        sessionId = socket.request.sessionId,
        userInfos = socket.request.user,
        thisUser, thisBooks = [], lastSearch = {}, lastDetail = {},
        defBooks = function (request, query) {
            return new Q.Promise(function (resolve, reject) {
                bookAPI[request](query, function (error, response) {
                    if (!!error || !response) { reject(error || new Error("No response!")); } else { resolve(response); }
                });
            });
        },
        searchDetail = function (bookid, callback) {
            if (!!lastDetail && !!lastDetail.id && _.isEqual(lastDetail.id, bookid)) { return callback(null, lastDetail); }
            defBooks("loadOne", { id: bookid })
                .then(function (book) { callback(null, book); })
                .catch(function (error) {
                    defBooks("searchOne", bookid)
                        .then(function (response) { callback(null, response); })
                        .catch(callback);
                });
        },
        searchLoop = function (fn, param, callback) {
            var defLoop = Q.defer(), listBooks = [],
                loop = function () {
                    bookAPI[fn](param, function (error, response) {
                        if (!!error) { console.error("searchLoop", error); }
                        if (!!response && !!response.items) {
                            var books = bookAPI.formatBooks(response.items), defCovers = [];
                            _.forEach(books, function (book) { defCovers.push(bookAPI.loadBase64(book.cover, book.id)); });
                            Q.allSettled(defCovers).then(function (results) {
                                results.forEach(function (result) {
                                    if (result.state === "fulfilled") {
                                        _.assign(_.find(books, _.matchesProperty("id", result.value.id)), { base64: result.value.base64 });
                                    }
                                });
                                listBooks.push(books);
                                param.startIndex += books.length;
                                if (_.isFunction(callback)) { callback(books); }
                                if (books.length === 40 && param.startIndex < 400) { loop(); } else { defLoop.resolve(_.flattenDeep(listBooks)); }
                            });
                        } else { defLoop.resolve(_.flattenDeep(listBooks)); }
                    });
                };
            _.assign(param, { startIndex: 0 });
            loop();
            return defLoop.promise;
        },
        addBook = function (bookid) {
            return new Q.Promise(function (resolve, reject) {
                searchDetail(bookid, function (error, book) {
                    if (!!error) { reject(error); }
                    if (!!book) {
                        resolve(book);
                        addBookToUser(book);
                    }
                });
            });
        },
        addBookToUser = function (book) {
            var update = { $addToSet: { books: { book: book.id }}};
            if (!!book.id.user && _.isEqual(book.id.user, thisUser._id)) {
                update.$inc = { "userbooks": 1 };
                thisUser.userbooks++;
            } else {
                if (!_.isObject(book.id) && !!thisUser.googleSync) { bookAPI.googleAdd({ volumeId: book.id }); }
            }
            if (!!book.from) { update.$addToSet.books.from = book.from; }
            if (!!book.alt) { update.$addToSet.books.cover = new ObjectID(book.alt); }
            userAPI.updateUser({ _id: thisUser._id }, update);
            thisBooks.push(book);
            if (!!book.isNew) {
                delete book.isNew;
                defBooks("updateBook", book);
            }
        },
        arraymove = function (arr, fromIndex, toIndex) {
            var element = arr[fromIndex];
            arr.splice(fromIndex, 1);
            arr.splice(toIndex, 0, element);
        };

    socket.on("isConnected", function () {
        if (!userInfos || !userInfos.username) { socket.emit("logout"); } else {
            userAPI.findUser(userInfos.username)
                .catch(function (error) {
                    if (!!userInfos.googleSignIn) {
                        return Q.Promise(function (resolve) {
                            userAPI.addUser(userInfos.username, "", userInfos.name)
                                .then(function (user) { resolve(user); }).catch(function (error) { console.error("isConnected - userAPI.addUser", error); resolve(false); });
                        });
                    } else {
                        console.error("isConnected - userAPI.findUser", error || new Error("No user Data"));
                        return !1;
                    }
                })
                .then(function (userData) {
                    if (!userData) { return socket.emit("logout", true); }
                    thisUser = userData;
                    var booksList = _.pluck(userData.books, "book"),
                        tagsList = _.countBy(_.flatten(_.compact(_.pluck(userData.books, "tags")), true).sort()),
                        coverList = _.compact(_.pluck(userData.books, "cover"));

                    thisUser.googleSignIn = !!userInfos.googleSignIn;
                    userAPI.updateUser({ _id: userData._id }, { "$set": { "last_connect": new Date() }, "$inc": { "connect_number": 1 }});
                    socket.emit("user", {
                        connex: thisUser.connect_number,
                        first: !thisUser.connect_number,
                        googleSignIn: !!thisUser.googleSignIn,
                        googleSync: thisUser.googleSync,
                        id: thisUser._id,
                        link: userInfos.link,
                        name: thisUser.name,
                        picture: userInfos.picture,
                        tags: tagsList,
                        session: sessionId,
                        orders: userData.orders
                    });
                    Q.allSettled([
                        defBooks("loadNotifs", { "_id.to": thisUser._id, isNew: true }),
                        defBooks("loadBooks", { id : { $in : booksList }}),
                        defBooks("loadCovers", { "_id": {$in: coverList }}),
                        defBooks("loadComments", { "_id.book" : { $in : booksList }})
                    ]).spread(function (Notifs, Books, Covers, Comments) {
                        var def64 = [],
                            indice = 0,
                            toSend = [],
                            sendCovers = [],
                            notifs = Notifs.value || [],
                            books = Books.value || [],
                            covers = Covers.value || [],
                            comments = _.groupBy(Comments.value, function (elt) { return JSON.stringify(elt._id.book); }) || [],
                            returnInfo = function (elt) { return _.isEqual(elt.book, books[book].id); },
                            returnComments = function (elt) { return elt._id.user !== thisUser._id; },
                            returnUserComments = function (elt) { return elt._id.user === thisUser._id; },
                            returnCover = function (cover) { return _.isEqual(cover._id.book, books[book].id); };

                        for (var book in books) {
                            var infos = _.find(userData.books, returnInfo),
                                comment = _.filter(comments[JSON.stringify(books[book].id)], returnComments),
                                userComment = _.filter(comments[JSON.stringify(books[book].id)], returnUserComments),
                                cover = _.find(covers, { _id: _.result(infos, "cover")});

                            books[book].tags = _.result(infos, "tags");
                            books[book].from = _.result(infos, "from");
                            books[book].comments = comment;
                            books[book].alt = _.result(infos, "cover");
                            books[book].userNote = 0;
                            books[book].userComment = books[book].userDate = "";
                            if (!!userComment.length) {
                                books[book].userComment = userComment[0].comment;
                                books[book].userNote = userComment[0].note;
                                books[book].userDate = userComment[0].date;
                            }
                            if (!!cover) {
                                if (!!books[book].cover) { bookAPI.removeCovers({ _id: { user: thisUser._id , book: books[book].id }}); } else {
                                    sendCovers.push({ "id": books[book].id, "alternative": cover.cover });
                                    books[book].mainColor = cover.color;
                                }
                            } else if (!!books[book].cover) {
                                def64.push(bookAPI.loadBase64(books[book].cover, books[book].id));
                                books[book].cover = true;
                            }
                            toSend.push(books[book]);
                            if (toSend.length % 40 === 0) {
                                socket.emit("initCollect", toSend);
                                toSend = [];
                            }
                        }
                        socket.emit("endCollect", {
                            tags: _.countBy(_.flatten(_.map(userData.books, "tags")).sort()),
                            notifs: notifs,
                            books: toSend
                        });
                        thisBooks = books;
                        Q.allSettled(def64).then(function (results) {
                            if (!!results.length) { sendCovers.push(_.map(results, "value")); }
                            socket.emit("covers", _.flatten(sendCovers));
                        }).catch(function (error) { console.error("isConnected - Q.allSettled(def64)", error); });
                    });
                });
        }
    });

    socket.on("searchBooks", function (param) {
        if (!!lastSearch && lastSearch.param && _.isEqual(lastSearch.param, param) && !!lastSearch.books) {
            socket.emit("books", lastSearch.books);
            socket.emit("endRequest", (!!lastSearch.books) ? lastSearch.books.length : 0);
        } else {
            searchLoop("searchBooks", param, function (books) { socket.emit("books", books); })
                .catch(function (error) { console.error("searchBooks", error); })
                .done(function (books) {
                    if (!!books) { lastSearch = { param: param, books: books }; }
                    socket.emit("endRequest", (!!books) ? books.length : 0);
                });
        }
    });

    socket.on("searchDetail", function (bookid) {
        searchDetail(bookid, function (error, response) {
            if (!!error) { console.error("searchDetail", error); }
            if (!!response) {
                lastDetail = response;
            }
            socket.emit("returnDetail", response);
        });
    });

    socket.on("addBook", function (bookid) {
        addBook(bookid)
            .then(function (book) { socket.emit("returnAdd", book); })
            .catch(function (error) { console.error("addBook", error); });
    });

    socket.on("addDetail", function () { addBookToUser(lastDetail); });

    socket.on("updateBook", function (data) {
        var defReq = [];
        if (data.hasOwnProperty("alternative") && data.hasOwnProperty("mainColor")) {
            defReq.push(defBooks("addCover", { cover: data.alternative, color: data.mainColor, date: new Date() }).then(function (cover) {
                userAPI.updateUser({ _id: thisUser._id, "books.book": data.id }, {$set: { "books.$.cover" : cover }});
            }));
        }
        if (data.hasOwnProperty("userNote") || data.hasOwnProperty("userComment")) {
            var update = { _id: { user: thisUser._id, book: data.id }, date: new Date(), name: thisUser.name };
            if (data.hasOwnProperty("userNote")) { update.note = data.userNote; }
            if (data.hasOwnProperty("userComment")) { update.comment = data.userComment; }
            defReq.push(defBooks((!update.note && !update.comment) ? "removeComment" : "updateComment", update));
        }
        if (data.hasOwnProperty("tags")) { defReq.push(userAPI.updateUser({ _id: thisUser._id, "books.book": data.id }, {$set: { "books.$.tags" : data.tags }})); }
        if (data.hasOwnProperty("update")) { defReq.push(defBooks("updateBook", _.assign(data.update, { id: data.id }))); }
        Q.allSettled(defReq).catch(function (error) { console.error("updateBook", error); });
    });

    socket.on("removeBook", function (bookid) {
        userAPI.updateUser({ _id: thisUser._id }, {$pull: { books: { book: bookid }}});
        _.remove(thisBooks, { id: bookid });
        defBooks("removeCovers", { _id: { user: thisUser._id, book: bookid }});
        defBooks("removeNotifs", { "id.book": bookid, from: thisUser._id });
        if (_.isEqual(bookid.user, thisUser._id)) {
            defBooks("removeOne", { id: bookid });
        } else if (!!thisUser.googleSync && !bookid.user) {
            defBooks("googleRemove", { volumeId: bookid }).catch(function (error) { console.error("googleRemove", error); });
        }
    });

    socket.on("updateUser", function (data) {
        userAPI.validateLogin(thisUser._id, data.pwd, thisUser.googleSignIn)
            .then(function (response) {
                var newData = { name: data.name, googleSync: !!data.googleSync };
                if (!!data.newPwd) { newData.password = userAPI.encryptPwd(data.newPwd); }
                userAPI.updateUser({ _id: thisUser._id }, {$set: newData });
                socket.emit("updateOk", data);
            })
            .catch(function (error) {
                console.error("updateUser", error);
                socket.emit("updateNok");
            });
    });

    socket.on("deleteUser", function (password) {
        var isDeleted = function () {
            bookAPI.removeUserData(thisUser._id);
            userAPI.removeUser({ _id: thisUser._id });
            socket.emit("logout");
        };
        if (!thisUser.googleSignIn) {
            userAPI.validateLogin(thisUser._id, password)
                .then(isDeleted)
                .catch(function (error) {
                    console.error("deleteUser", error);
                    socket.emit("updateNok");
                });
        } else {
            isDeleted();
        }
    });

    socket.on("sendNotif", function (data) {
        userAPI.hasBook(data.recommand.toLowerCase(), data.book, function (error, response) {
            if (!!error) { console.error("sendNotif", error); }
            if (!response) {
                defBooks("updateNotif", {
                    _id: {
                        to: data.recommand.toLowerCase(),
                        book: data.book
                    },
                    from: thisUser.name + "<" + thisUser._id + ">",
                    isNew: true,
                    title: data.title,
                    alt: data.alt
                });
                mailAPI.sendToFriend(thisUser.name + "<" + thisUser._id + ">", data.recommand.toLowerCase(), data.title, data.alt);
            }
        });
    });

    socket.on("readNotif", function (notif) {
        searchDetail(notif._id.book, function (error, response) {
            if (!!error) { console.error("readNotif", error); }
            if (!!response) {
                response.from = notif.from;
                if (!response.base64 && !!notif.alt) {
                    response.alt = notif.alt;
                    bookAPI.loadCover({ _id: new ObjectID(notif.alt) }, function (error, result) {
                        if (!!error) { console.error(error); }
                        if (!!result) {
                            response.base64 = result.cover;
                            response.mainColor = result.color;
                        }
                        socket.emit("returnNotif", lastDetail = response);
                    });
                } else {
                    socket.emit("returnNotif", lastDetail = response);
                }
            }
        });
        defBooks("updateNotif", { _id: notif._id, isNew: false });
    });

    socket.on("associated", function (bookid) {
        searchLoop("associatedBooks", { volumeId: bookid }, function (books) { socket.emit("books", books); })
            .catch(function (error) { console.error("associated", error); })
            .done(function (books) { socket.emit("endRequest", (!!books) ? books.length : 0); });
    });

    socket.on("recommanded", function () {
        searchLoop("myGoogleBooks", { search: true, shelf: 8 }, function (books) { socket.emit("books", books); })
            .catch(function (error) { console.error("recommanded", error); })
            .done(function (books) { socket.emit("endRequest", (!!books) ? books.length : 0); });
    });

    socket.on("importNow", function () {
        if (!thisUser.googleSignIn) { return; }
        var qAdd = [], qCover = [], sendCovers = [],
            gestionImport = function (books) {
                _.forEach(books, function (book) {
                    if (_.findIndex(thisUser.books, { book: book.id}) === -1) {
                        qAdd.push(addBook(book.id).then(function (added) {
                            if (!!added.cover) {
                                if (!added.base64) { qCover.push(bookAPI.loadBase64(added.cover, added.id)); } else {
                                    sendCovers.push({ "id": added.id, "base64": added.base64 });
                                }
                                added.cover = true;
                            }
                        }));
                    }});
            };

        searchLoop("myGoogleBooks", {}, gestionImport).done(function () {
            Q.allSettled(qAdd)
                .then(function () {
                    socket.emit("initCollect", thisBooks);
                    Q.allSettled(qCover).then(function (covers) {
                        if (!!covers.length) { sendCovers.push(_.map(covers, "value")); }
                        socket.emit("covers", _.flatten(sendCovers));
                    });
                })
                .catch(function (error) { console.error("importNow", error); })
                .done(function () { socket.emit("endCollect", {}); });
        });
    });

    socket.on("exportNow", function () {
        if (!thisUser.googleSignIn) { return; }
        var defExport = [];
        for (var jta in thisUser.books) {
            defExport.push(defBooks("googleAdd", { volumeId: thisUser.books[jta].book }));
        }
        Q.allSettled(defExport).catch(function (error) { console.error("exportNow", error); });
    });

    socket.on("newbook", function (data) {
        var newbook = _.merge({ id: { user: thisUser._id, book: thisUser.userbooks }, isNew: true }, data);
        addBookToUser(newbook);
        return socket.emit("newbook", newbook);
    });

    socket.on("orders", function (order) {
        var query = { _id: thisUser._id }, update = {};
        if (order.new) {
            query["orders.id"] = order.data.id;
            update.$set = { "orders.$.order": order.data.order };
        } else {
            update.$addToSet = { "orders": order.data };
        }
        userAPI.updateUser(query, update);
    });
};
