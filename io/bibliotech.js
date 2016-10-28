const Q = require("q"),
    _ = require("lodash"),
	//url = require("url"),
	//fs = require("fs"),
    console = require("../tools/console"),
    UAParser = require("ua-parser-js"),
    ObjectID = require("mongodb").ObjectID,
    UsersAPI = require("../db/users"),
    BooksAPI = require("../db/books"),
    MailsAPI = require("../tools/mails");

exports = module.exports = function main (socket) {
    "use strict";

    var thisUser = socket.request.user,
        token = thisUser.token,
        sessionId = socket.request.sessionID,
        userAPI = UsersAPI(),
        bookAPI = BooksAPI(token),
        mailAPI = MailsAPI(),
        thisBooks = [], lastSearch = {}, lastDetail = {},
        addBook = function (bookid) {
            return new Q.Promise(function (resolve, reject) {
                searchDetail(bookid).then((book) => {
                    resolve(book);
                    return book;
                }).then(addBookToUser).catch(reject);
            });
        },
        addBookToUser = function (book) {
            var update = { "$addToSet": { "books": { "book": book.id }}};
            if (!!book.id.user && _.isEqual(book.id.user, thisUser._id)) {
                update.$inc = { "userbooks": 1 };
                thisUser.userbooks++;
            } else {
                if (!_.isObject(book.id) && !!thisUser.googleSync) { bookAPI.googleAdd({ "volumeId": book.id }); }
            }
            if (book.from) { update.$addToSet.books.from = book.from; }
            if (book.alt) { update.$addToSet.books.cover = new ObjectID(book.alt); }
            userAPI.updateUser({ "_id": thisUser._id }, update);
            thisBooks.push(book);
            if (book.isNew) { bookAPI.updateBook(book); }
        },
        // arraymove = function (arr, fromIndex, toIndex) {
        //     var element = arr[fromIndex];
        //     arr.splice(fromIndex, 1);
        //     arr.splice(toIndex, 0, element);
        // },
        isConnected = function (userId) {
            // var friend = _.find(allSessions, _.matchesProperty("user", userId));
            // return !!friend ? friend.id : null;
        },
        searchDetail = function (bookid) {
            return new Q.Promise((resolve, reject) => {
                if (!!lastDetail && !!lastDetail.id && _.isEqual(lastDetail.id, bookid)) {
                    resolve(lastDetail);
                } else {
                    bookAPI.loadOne({ id: bookid }).then((book) => {
                        if (!book) { throw "No book found!"; }
                        return book;
                    }).catch(() => {
                        return bookAPI.searchOne(bookid);
                    }).then((infos) => {
                        if (!infos || !infos.id) {
                            reject("No detail!!!");
                        } else {
                            bookAPI.loadComments({ "_id.book" : infos.id }).then((comments) => {
                                infos.comments = comments;
                                return infos;
                            }).catch(() => {
                                return infos;
                            }).then(resolve);
                        }
                    }).catch(reject);
                }
            });
        },
        searchLoop = function (fn, param, callback) {
            var defLoop = Q.defer(),
                listBooks = [],
                defCovers = [],
                loop = function () {
                    bookAPI[fn](param).then((response) => {
                        if (!!response && !!response.items) {
                            var books = bookAPI.formatBooks(response.items);
                            listBooks.push(books);
                            param.startIndex += books.length;
                            if (_.isFunction(callback)) { callback(books); }
                            _.forEach(books, function (book) {
                                if (book.thumbnail || book.cover) {
                                    defCovers.push(bookAPI.loadBase64(book.id, book.thumbnail || book.cover).then((result) => {
                                        var cover = { "id": result.id };
                                        cover[book.thumbnail ? "thumbnail": "cover"] = result.base64;
                                        socket.emit("cover", cover);
                                    }));
                                }
                            });
                            if (books.length === 40 && param.startIndex < 400) {
                                loop();
                            } else {
                                beforeResolve();
                            }
                        } else { beforeResolve(); }
                    }).catch((error) => { console.error(thisUser._id, "searchLoop", error); });
                },
                beforeResolve = function () {
                    listBooks = _.flattenDeep(listBooks);
                    socket.emit("endRequest", listBooks.length);
                    Q.allSettled(defCovers).then((results) => {
                        _.forEach(results, (result) => { if (result.state === "fulfilled") { _.assign(_.find(listBooks, _.matchesProperty("id", result.value.id)), result.value); }});
                        defLoop.resolve(listBooks);
                    });
                };

            _.assign(param, { startIndex: 0 });
            loop();
            return defLoop.promise;
        },
        browser_type = new UAParser().setUA(socket.handshake.headers["user-agent"]).getDevice().type || "desktop";

    if (_.isEmpty(thisUser) || !thisUser._id) { socket.emit("logout"); }

    socket.once("disconnect", () => { console.warn("socket.disconect", thisUser._id, thisUser.name); });

    socket.once("isConnected", function () {
        console.info("Connexion", thisUser._id, "@", new Date().toString("yyyy/MM/dd"), browser_type);
        var booksList = _.map(thisUser.books, "book"),
            coverList = _.compact(_.map(thisUser.books, "cover")),
			sendingLg = browser_type !== "mobile" ? 10 : 40;

        userAPI.updateUser({ "_id": thisUser._id }, { "$set": { "last_connect": new Date() }, "$inc": { "connect_number": 1 }});
        socket.emit("user", {
            connex: thisUser.connect_number,
            first: !thisUser.connect_number,
            googleSignIn: thisUser.googleSignIn,
            googleSync: thisUser.googleSync,
            id: thisUser._id,
            link: thisUser.infos ? thisUser.infos.link : null,
            name: thisUser.name,
            picture: thisUser.infos ? thisUser.infos.picture : null,
            session: sessionId,
            orders: thisUser.orders
        });
        Q.allSettled([
            bookAPI.loadNotifs({ "_id.to": thisUser._id, "isNew": true }),
            bookAPI.loadBooks({ "id" : { "$in" : booksList }}),
            bookAPI.loadAlts({ "_id": { "$in": coverList }}),
            bookAPI.loadComments({ "_id.book" : { "$in" : booksList }})
        ]).spread(function (Notifs, Books, Covers, Comments) {
            var def64 = [],
                //indice = 0,
                toSend = [],
                sendCovers = [],
                notifs = Notifs.value || [],
                books = _.sortBy(Books.value, function (book) { return book.title.toLowerCase(); }) || [],
                covers = Covers.value || [],
                comments = _.groupBy(Comments.value, function (elt) { return JSON.stringify(elt._id.book); }) || [],
                returnInfo = function (elt) { return _.isEqual(elt.book, books[book].id); },
                returnComments = function (elt) { return elt._id.user !== thisUser._id; },
                returnUserComments = function (elt) { return elt._id.user === thisUser._id; },
                //returnCover = function (cover) { return _.isEqual(cover._id.book, books[book].id); },
                loadCover = function (id, cover) { return bookAPI.loadBase64(id, cover).then(function (base64) { return base64; }); };

            if (notifs.length) { socket.emit("notifs", notifs); }

            for (var book in books) {
                var infos = _.find(thisUser.books, returnInfo),
                    comment = _.filter(comments[JSON.stringify(books[book].id)], returnComments),
                    userComment = _.filter(comments[JSON.stringify(books[book].id)], returnUserComments),
                    thumbnail = _.find(covers, { _id: _.result(infos, "thumbnail")}),
                    cover = _.find(covers, { _id: _.result(infos, "cover")});

                books[book].tags = _.result(infos, "tags");
                books[book].from = _.result(infos, "from");
                books[book].comments = comment;
                books[book].alt = _.result(infos, "cover");
                books[book].userNote = 0;
                books[book].userComment = books[book].userDate = "";
                if (userComment.length) {
                    books[book].userComment = userComment[0].comment;
                    books[book].userNote = userComment[0].note;
                    books[book].userDate = userComment[0].date;
                }
                toSend.push(_.clone(books[book]));
                if (cover) {
                    if (books[book].cover) {
                        bookAPI.removeCovers({ "_id": { "user": thisUser._id , "book": books[book].id }});
                        userAPI.updateUser({ "_id": thisUser._id, "books.book": books[book].id }, {"$unset": { "books.$.cover" : true }});
                    } else {
                        sendCovers.push({ "id": books[book].id, "alternative": cover.cover });
						books[book].alternative = cover.cover;
                    }
                }
                if (books[book].cover || books[book].thumbnail) {
                    def64.push(loadCover(books[book].id, books[book].cover || books[book].thumbnail));
				}
                if (browser_type !== "mobile" && toSend.length % sendingLg === 0) {
                    socket.emit("initCollect", toSend);
                    socket.emit("covers", sendCovers);
                    toSend = [];
					sendCovers = [];
                }
            }
            thisBooks = books;

            socket.on("tenmore", function () {
                if (!toSend.length) { return socket.emit("endCollect"); }
                socket.emit("moreten", toSend.splice(0, 10));
            });

            if (browser_type === "mobile") { socket.emit("initCollect", toSend.splice(0, 10)); } else { socket.emit("endCollect", toSend); }

			socket.on("endCollect", function () {
				var assignCover = function (slicedOne) {
					if (!!slicedOne && !!slicedOne.id) {
						_.assign(_.find(thisBooks, _.matchesProperty("id", slicedOne.id)), slicedOne);
					}
				};
				Q.allSettled(def64).then(function (results) {
					if (results.length) { sendCovers.push(_.map(results, "value")); }
					sendCovers = _.flattenDeep(sendCovers);
                    console.log("sendCovers", sendCovers);
					for (var jta = 0, lg = sendCovers.length; jta < lg; jta += 10) {
						var sliced = _.slice(sendCovers, jta, jta + 10);
						socket.emit("covers", sliced);
						_.forEach(sliced, assignCover);
					}
				}).catch(function (error) { console.error(thisUser._id, "isConnected - Q.allSettled(def64)", error); });
			});
        });
    });

    socket.on("searchBooks", function (result) {
        var param = { "q": result.by + result.search, "langRestrict": result.lang };
        if (!!lastSearch && lastSearch.param && _.isEqual(lastSearch.param, param) && !!lastSearch.books) {
            socket.emit("books", lastSearch.books);
            socket.emit("endRequest", lastSearch.books ? lastSearch.books.length : 0);
        } else {
            searchLoop("searchBooks", param, (books) => {
                socket.emit("books", books);
            }).catch((error) => {
                console.error(thisUser._id, "searchBooks", error);
            }).done((books) => {
                if (books) { lastSearch = { "param": param, "books": books }; }
            });
        }
    });

    socket.on("searchDetail", function (bookid) {
        var response;
        searchDetail(bookid).then((result) => {
            if (result) { lastDetail = response = result; }
        }).catch((error) => {
            console.error("searchDetail", thisUser._id, error);
        }).done(() => {
            socket.emit("returnDetail", response);
        });
    });

    socket.on("addBook", function (bookid) {
        addBook(bookid).then((book) => { socket.emit("returnAdd", book); }).catch((error) => { console.error(thisUser._id, "addBook", error); });
    });

    socket.on("addDetail", function () { addBookToUser(lastDetail); });

    socket.on("updateBook", function (data) {
        var defReq = [];
            // infos = _.find(thisBooks, _.matchesProperty("id", data.id));

        if (data.hasOwnProperty("alternative")) {
            defReq.push(bookAPI.addCover({ cover: data.alternative, date: new Date() }).then(function (cover) {
                userAPI.updateUser({ "_id": thisUser._id, "books.book": data.id }, {"$set": { "books.$.cover" : cover }});
            }));
            delete data.alternative;
        }
        if (data.hasOwnProperty("userNote") || data.hasOwnProperty("userComment")) {
            var update = { "_id": { "user": thisUser._id, "book": data.id }, "date": new Date(), "name": thisUser.name };
            if (data.hasOwnProperty("userNote")) { update.note = data.userNote; }
            if (data.hasOwnProperty("userComment")) { update.comment = data.userComment; }
            defReq.push(bookAPI[!update.note && !update.comment ? "removeComment" : "updateComment"](update));
            delete data.userNote;
            delete data.userComment;
            delete data.userDate;
        }
        if (data.hasOwnProperty("tags")) {
            defReq.push(userAPI.updateUser({ "_id": thisUser._id, "books.book": data.id }, {"$set": { "books.$.tags" : data.tags }}));
            delete data.tags;
        }
        if (_.keys(data).length > 1) { defReq.push(bookAPI.updateBook(_.assign(data, { "id": data.id }))); }
        Q.allSettled(defReq).catch(function (error) { console.error(thisUser._id, "updateBook", error); });
    });

    socket.on("removeBook", function (bookid) {
        userAPI.updateUser({ "_id": thisUser._id }, {"$pull": { "books": { "book": bookid }}});
        _.remove(thisBooks, { "id": bookid });
        bookAPI.removeCovers({ "_id": { "user": thisUser._id, "book": bookid }});
        bookAPI.removeNotifs({ "id.book": bookid, "from": thisUser._id });
        bookAPI.removeComment({ "_id": { "user": thisUser._id, "book": bookid }});
        if (_.isEqual(bookid.user, thisUser._id)) {
            bookAPI.removeOne({ "id": bookid });
        } else if (!!thisUser.googleSync && !bookid.user) {
            bookAPI.googleRemove({ "volumeId": bookid }).catch(function (error) { console.error(thisUser._id, "googleRemove", error); });
        }
    });

    socket.on("updateUser", function (data) {
        userAPI.validateLogin(thisUser._id, data.pwd, thisUser.googleSignIn)
            .then(() => {
                var newData = { "name": data.name, "googleSync": !!data.googleSync };
                if (data.newPwd) { newData.password = userAPI.encryptPwd(data.newPwd); }
                userAPI.updateUser({ "_id": thisUser._id }, {"$set": newData });
                socket.emit("updateUser", data);
            })
            .catch(function (error) {
                console.error(thisUser._id, "updateUser", error);
                socket.emit("updateNok");
            });
    });

    socket.on("deleteUser", function (password) {
        var isDeleted = function () {
            bookAPI.removeUserData(thisUser._id);
            userAPI.removeUser({ "_id": thisUser._id });
            socket.emit("logout");
        };
        if (thisUser.googleId) { password = thisUser.googleId; }
        userAPI.validateLogin(thisUser._id, password)
            .then(isDeleted)
            .catch(function (error) {
                console.error(thisUser._id, "deleteUser", error);
                socket.emit("updateNok");
            });
    });

    socket.on("sendNotif", function (data) {
        var infos = _.find(thisBooks, _.matchesProperty("id", data.id));
        if (!infos) { return false; }
        userAPI.hasBook(data.recommand.toLowerCase(), data.id)
            .then(function (response) {
                if (!response) {
                    var notif = {
                        "_id": { "to": data.recommand.toLowerCase(), "book": data.id },
                        "from": thisUser.name + " <" + thisUser._id + ">",
                        "isNew": true,
                        "title": infos.title,
                        "alt": infos.alt,
                        "date": new Date()
                    };
                    bookAPI.updateNotif(notif);
                    var socketId = isConnected(data.recommand.toLowerCase());
                    if (socketId) { socket.to(socketId).emit("newNotif", notif); }
                    mailAPI.sendToFriend(thisUser.name, thisUser._id, data.recommand.toLowerCase(), infos);
                }
            }).catch(function (error) { console.error(thisUser._id, "sendNotif", error); });
    });

    socket.on("readNotif", function (notif) {
        searchDetail(notif._id.book, function (error, response) {
            if (error) { console.error(thisUser._id, "readNotif", error); }
            if (response) {
                response.from = notif.from;
                if (!response.base64 && !!notif.alt) {
                    response.alt = notif.alt;
                    /*bookAPI.loadAlt({ "_id": new ObjectID(notif.alt) }, function (error, result) {
                        if (!!error) { console.error(error); }
                        if (!!result) { response.base64 = result.cover; }
                        socket.emit("returnNotif", lastDetail = response);
                    });*/
                    bookAPI.loadAlt({ "_id": new ObjectID(notif.alt) }).then((result) => {
                        response.base64 = result.cover;
                    }).catch((error) => {
                        console.error(error);
                    }).done(() => {
                        socket.emit("returnNotif", lastDetail = response);
                    });
                } else {
                    socket.emit("returnNotif", lastDetail = response);
                }
            }
        });
        bookAPI.updateNotif({ "_id": notif._id, "isNew": false });
    });

    socket.on("associated", function (bookid) {
        searchLoop("associatedBooks", { "volumeId": bookid }, function (books) { socket.emit("books", books); })
            .catch(function (error) { console.error(thisUser._id, "associated", error); })
            .done(function (books) { socket.emit("endRequest", books ? books.length : 0); });
    });

    socket.on("recommanded", function () {
        searchLoop("myGoogleBooks", { "search": true, "shelf": 8 }, function (books) {
            socket.emit("books", books);
        }).catch(function (error) {
            console.error(thisUser._id, "recommanded", error);
        }).done(function (books) {
            console.log("recommanded", new Date(), books.length || 0);
            socket.emit("endRequest", books ? books.length : 0);
        });
    });

    socket.on("importNow", function () {
        if (!thisUser.googleSignIn) { return socket.emit("endCollect", {}); }
        var qAdd = [], qCover = [], sendCovers = [],
            gestionImport = function (books) {
                _.forEach(books, function (book) {
                    if (_.findIndex(thisUser.books, { "book": book.id}) === -1) {
                        qAdd.push(addBook(book.id).then(function (added) {
                            if (added.cover) {
                                if (!added.base64) { qCover.push(bookAPI.loadBase64(added.id, added.cover)); } else {
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
                        if (covers.length) { sendCovers.push(_.map(covers, "value")); }
                        socket.emit("covers", _.flatten(sendCovers));
                    });
                })
                .catch(function (error) { console.error(thisUser._id, "importNow", error); })
                .done(function () { socket.emit("endCollect", {}); });
        });
    });

    socket.on("exportNow", function () {
        if (!thisUser.googleSignIn) { return; }
        var defExport = [];
        for (var jta in thisUser.books) {
            defExport.push(bookAPI.googleAdd({ "volumeId": thisUser.books[jta].book }));
        }
        Q.allSettled(defExport)
            .catch(function (error) { console.error(thisUser._id, "exportNow", error); });
    });

    socket.on("newbook", function (data) {
        var newbook = _.merge({ "id": { "user": thisUser._id, "book": thisUser.userbooks }, "isNew": true, "date": new Date() }, data);
        addBookToUser(newbook);
        return socket.emit("newbook", newbook);
    });

    socket.on("orders", function (order) {
        var query = { "_id": thisUser._id }, update = {};
        if (!order.new) {
            query["orders.id"] = order.id;
            update.$set = { "orders.$.order": order.order };
        } else {
            delete order.new;
            update.$addToSet = { "orders": order };
        }
        userAPI.updateUser(query, update);
    });

    socket.on("mostAdded", function (bookid) {
        userAPI.mostAdded(bookid, thisUser._id, _.map(thisUser.books, "book"))
            .then(function (result) {
                var def = [],
                    fullLoad = function (id) {
                        return new Q.Promise(function (resolve) {
                            /*bookAPI.loadOne({ id: id }, function (error, response) {
                                if (!!error || !response) { return resolve(); }
                                var book = {
                                    "id": response.id,
                                    "title": response.title,
                                    "authors": response.authors.join(", ")
                                };
                                if (!response.cover) { return resolve(book); }
                                bookAPI.loadBase64(response.id, response.cover).done(function (cover) {
                                    if (!cover || !cover.base64) { return resolve(book); }
                                    book.base64 = cover.base64;
                                    resolve(book);
                                });
                            });*/
                            bookAPI.loadOne({ id: id }).then((response) => {
                                if (!response) { resolve(); } else {
                                    var book = {
                                        "id": response.id,
                                        "title": response.title,
                                        "authors": response.authors.join(", ")
                                    };
                                    bookAPI.loadBase64(response.id, response.cover).then(function (cover) {
                                        if (cover) { book.base64 = cover.base64; }
                                        resolve(book);
                                    });
                                }
                            });
                        });
                    };

                for (var jta = 0, lg = result.length; jta < lg; jta++) { def.push(fullLoad(result[jta])); }
                Q.allSettled(def).then(function (results) {
                    var mostAdded = [];
                    for (jta = 0, lg = results.length; jta < lg; jta++) {
                        if (results[jta].state === "fulfilled" && !!results[jta].value) { mostAdded.push(results[jta].value); }
                    }
                    if (mostAdded.length) { socket.emit("mostAdded", { "book": bookid, "mostAdded": mostAdded }); }
                });
            })
            .catch(function (error) { console.error(thisUser._id, "mostAdded", error); });
    });
};
