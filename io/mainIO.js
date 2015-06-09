var MailsAPI = require("../tools/mails").MailsAPI,
    Q = require("q"),
    ent = require("ent"),
    _ = require("lodash"),
    fs = require("fs"),
    BooksAPI = require("../db/books").BooksAPI,
    google = require("googleapis"),
    gOptions = { timeout: 5000 },
    gAuth = google.oauth2({ version: "v2" });

if (require("ip").address() === "128.1.236.11") { gOptions.proxy = "http://CGDM-EMEA\jtassin:password_4@isp-ceg.emea.cegedim.grp:3128/"; }
google.options(gOptions);

module.exports = mainIO = function (socket, db) {
    "use strict";

    var sessionDB = db.collection("sessions"),
        sessionId = socket.handshake.sessionId,
        userAPI = new UsersAPI(db),
        bookAPI = new BooksAPI(db),
        mailAPI = new MailsAPI(db),
        thisUser, thisBooks = [], lastSearch = {}, lastDetail = {},
        currUser = function (id) {
            var defGet = Q.defer();
            sessionDB.findOne({ _id: id }, function (err, response) {
                if (!!err || !response.session) { defGet.reject(err || new Error("No session!!!")); } else {
                    var session = JSON.parse(response.session);
                    if (!session.user && !session.token && !session.token.credentials) { defGet.reject(new Error("Invalid session!!!")); } else {
                        if (!!session.user) { defGet.resolve({ username: session.user }); } else {
                            gAuth.userinfo.v2.me.get(session.token.credentials, function (err, infos) {
                                if (!!err || !infos) { defGet.reject(err || new Error("gAuth - No info")); } else {
                                    defGet.resolve({
                                        username: infos.email,
                                        name: infos.name,
                                        googleSignIn: true,
                                        link: infos.link,
                                        picture: infos.picture,
                                        token: session.token.credentials
                                    });
                                }
                            });
                        }
                    }
                }
            });
            return defGet.promise;
        },
        defBooks = function (request, query) {
            var defReq = Q.defer();
            bookAPI[request](query, function (error, response) { if (!!error || !response) { defReq.reject(error || new Error("No response!")); } else { defReq.resolve(response); } });
            return defReq.promise;
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
            var defLoop = Q.defer(), listBooks = [], params = _.assign({ startIndex: 0 }, param),
                loop = function () {
                    bookAPI[fn](params, function (error, response) {
                        if (!!error) { console.error("searchLoop", error); }
                        if (!!response && !!response.items) {
                            var books = bookAPI.formatBooks(response.items), defCovers = [];
                            _.forEach(books, function (book, index) { defCovers.push(bookAPI.loadBase64(book.cover, index)); });
                            Q.allSettled(defCovers).then(function (results) {
                                results.forEach(function (result) {
                                    if (result.state === "fulfilled") { books[result.value.index].cover = result.value.base64; }
                                });
                                listBooks.push(books);
                                params.startIndex += books.length;
                                if (_.isFunction(callback)) { callback(books); }
                                if (books.length === 40 && params.startIndex < 400) { loop(); } else { defLoop.resolve(_.flattenDeep(listBooks)); }
                            });
                        } else { defLoop.resolve(_.flattenDeep(listBooks)); }
                    });
                };
            loop();
            return defLoop.promise;
        },
        addBook = function (bookid) {
            var defAdd = Q.defer();
            searchDetail(bookid, function (error, book) {
                if (!!error) { defAdd.reject(error); }
                if (!!book) {
                    addBookToUser(book);
                    defAdd.resolve(book);
                }
            });
            return defAdd.promise;
        },
        addBookToUser = function (book) {
            userAPI.updateUser({ _id: thisUser._id }, {$addToSet: { books: { book: book.id }}});
            if (!!book.isNew) { defBooks("updateBook", book); }
            if (!!book.id.user && _.isEqual(book.id.user, thisUser._id)) {
                userAPI.updateUser({ _id: thisUser._id }, { "$inc": { "userbooks": 1 }});
                thisUser.userbooks++;
            } else {
                if (!_.isObject(book.id) && !!thisUser.googleSync) { bookAPI.googleAdd(_.assign({ volumeId: book.id }, thisUser.token)); }
            }
            thisBooks.push(book);
        };

    socket.on("isConnected", function () {
        currUser(sessionId)
            .then(function (userInfos) {
                userAPI.findUser(userInfos.username)
                    .catch(function (error) {
                        if (!!userInfos.googleSignIn) {
                            userAPI.addUser(userInfos.username, userInfos.username, userInfos.name, function (error) {
                                if (!!error) {
                                    console.error("isConnected - userAPI.addUser", error);
                                    return socket.emit("logout", true);
                                }
                                return {
                                    _id: userInfos.username,
                                    name: userInfos.name
                                };
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
                            tagsList = _.countBy(_.flatten(_.compact(_.pluck(userData.books, "tags")), true).sort());

                        thisUser.googleSignIn = !!userInfos.googleSignIn;
                        thisUser.token = userInfos.token;
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
                            tags: tagsList
                        });
                        Q.allSettled([
                            defBooks("loadNotifs", { "_id.to": thisUser._id, isNew: true }),
                            defBooks("loadBooks", { id : { $in : booksList }}),
                            defBooks("loadCovers", { "_id.user" : thisUser._id }),
                            defBooks("loadComments", { "_id.book" : { $in : booksList }})
                        ]).spread(function (Notifs, Books, Covers, Comments) {
                            var def64 = [],
                                notifs = Notifs.value || [],
                                books = Books.value || [],
                                covers = Covers.value || [],
                                comments = _.groupBy(Comments.value, function (elt) { return elt._id.book; }) || [],
                                returnTags = function (elt) { return _.isEqual(elt.book, books[book].id); },
                                returnComments = function (elt) { return elt._id.user !== thisUser._id; },
                                returnUserComments = function (elt) { return elt._id.user === thisUser._id; },
                                returnCover = function (cover) { return _.isEqual(cover._id.book, books[book].id); };

                            for (var book in books) {
                                var tags = _.result(_.find(userData.books, returnTags), "tags"),
                                    comment = _.filter(comments[books[book].id], returnComments),
                                    userComment = _.filter(comments[books[book].id], returnUserComments),
                                    cover = _.find(covers, returnCover);

                                books[book].tags = tags;
                                books[book].comments = comment;
                                if (!!userComment.length) {
                                    books[book].userComment = userComment[0].comment || "";
                                    books[book].userNote = userComment[0].note || "";
                                    books[book].userDate = userComment[0].date || "";
                                }
                                if (!!cover) {
                                    if (!!books[book].cover) { bookAPI.removeCovers({ _id: { user: thisUser._id , book: books[book].id }}); } else {
                                        books[book].alternative = cover.cover;
                                        books[book].mainColor = cover.mainColor;
                                    }
                                } else if (!!books[book].cover) { def64.push(bookAPI.loadBase64(books[book].cover, book)); }
                            }
                            Q.allSettled(def64).then(function (results) {
                                var covers = _.map(results, "value");
                                for (var cover in covers) {
                                    if (!!covers[cover] && !!covers[cover].index) {
                                        books[covers[cover].index].base64 = covers[cover].base64;
                                    }
                                }
                                thisBooks = books;
                                socket.emit("collection", {
                                    tags: _.countBy(_.flatten(_.map(userData.books, "tags")).sort()),
                                    orders: thisUser.orders,
                                    notifs: notifs,
                                    books: thisBooks
                                });
                                socket.emit("endRequest", books.length);
                            }).catch(function (error) { console.error("isConnected - Q.allSettled(def64)", error); });
                        });
                    });
            }).catch(function (error) { console.error("isConnected - currUser", error); socket.emit("logout", true); });
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
                socket.emit("returnDetail", response);
                lastDetail = response;
            }
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
        if (!!data.alternative && !!data.maincolor) {
            defReq.push(defBooks("updateCover", { _id: { user: thisUser._id, book: data.id }, cover: data.alternative, mainColor: data.maincolor, date: new Date() }));
        }
        if (!!data.userNote || !!data.userComment) {
            var update = { _id: { user: thisUser._id, book: data.id }, date: new Date(), name: thisUser.name };
            if (!!data.userNote) { update.note = data.userNote; }
            if (!!data.userComment) { update.comment = data.userComment; }
            defReq.push(defBooks("updateComment", update));
        }
        if (!!data.tags) { defReq.push(userAPI.updateUser({ _id: thisUser._id, "books.book": data.id }, {$set: { "books.$.tags" : data.tags }})); }
        if (!!data.update) { defReq.push(defBooks("updateBook", _.assign(data.update, { id: data.id }))); }
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
            defBooks("googleRemove", _.assign({ volumeId: bookid }, thisUser.token))
                //.then(function (response) { console.log(response); })
                .catch(function (error) { console.error("googleRemove", error); });
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
        userAPI.validateLogin(thisUser._id, password)
            .then(function (response) {
                bookAPI.removeUserData(thisUser._id);
                userAPI.removeUser({ _id: thisUser._id });
                socket.emit("logout");
            })
            .catch(function (error) {
                console.error("deleteUser", error);
                socket.emit("updateNok");
            });
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
                    title: data.title
                });
            }
        });
    });

    socket.on("readNotif", function (bookid) {
        searchDetail(bookid, function (error, response) {
            if (!!error) { console.error("readNotif", error); }
            if (!!response) { socket.emit("returnNotif", lastDetail = response); }
        });
        defBooks("updateNotif", { _id: { to: thisUser._id, book: bookid }, isNew: false });
    });

    socket.on("associated", function (bookid) {
        searchLoop("associatedBooks", { volumeId: bookid }, function (books) { socket.emit("books", books); })
            .catch(function (error) { console.error("associated", error); })
            .done(function (books) { socket.emit("endRequest", (!!books) ? books.length : 0); });
    });

    socket.on("recommanded", function () {
        searchLoop("myGoogleBooks", _.assign({ search: true, shelf: 8 }, thisUser.token), function (books) { socket.emit("books", books); })
            .catch(function (error) { console.error("recommanded", error); })
            .done(function (books) { socket.emit("endRequest", (!!books) ? books.length : 0); });
    });

    socket.on("importNow", function () {
        if (!thisUser.token) { return; }
        var qAdd = [], params = _.assign(thisUser.token),
            gestionImport = function (books) {
                _.forEach(books, function (book) {
                    if (_.findIndex(thisUser.books, { book: book.id}) === -1) {
                        qAdd.push(addBook(book.id));
                    }
                });
            };

        searchLoop("myGoogleBooks", params, gestionImport).done(function () {
            Q.allSettled(qAdd)
                .then(function () { socket.emit("collection", { books: _.sortBy(thisBooks, "title") }); })
                .catch(function (error) { console.error("importNow", error); })
                .done(function () { socket.emit("endRequest", thisBooks.length); });
        });
    });

    socket.on("exportNow", function () {
        var defExport = [];
        if (!thisUser.token) { return; }
        for (var jta in thisUser.books) {
            defExport.push(defBooks("googleAdd", _.assign({ volumeId: thisUser.books[jta].book }, thisUser.token)));
        }
        Q.allSettled(defExport).catch(function (error) { console.error("exportNow", error); });
    });

    socket.on("newbook", function (data) {
        var newbook = _.assign({ id: { user: thisUser._id, book: thisUser.userbooks }, isNew: true }, data);
        addBookToUser(newbook);
        return socket.emit("newbook", newbook);
    });
};
