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
        thisUser, thisBooks, oauth2Client, lastSearch, lastDetail,
        userAPI = new UsersAPI(db),
        bookAPI = new BooksAPI(db),
        mailAPI = new MailsAPI(db),
        currUser = function (id) {
            var defGet = Q.defer();
            sessionDB.findOne({ _id: id }, function (err, response) {
                if (!!err || !response.session) { defGet.reject(err || new Error("No session!!!")); } else {
                    var session = JSON.parse(response.session);
                    if (!session.user && !session.token && !session.token.credentials) { defGet.reject(new Error("Invalid session!!!")); } else {
                        if (!!session.user) { defGet.resolve({ username: session.user }); } else {
                            oauth2Client = session.token.credentials;
                            gAuth.userinfo.v2.me.get(oauth2Client, function (err, infos) {
                                if (!!err || !infos) { defGet.reject(err || new Error("gAuth - No info")); } else {
                                    defGet.resolve({
                                        username: infos.email,
                                        name: infos.name,
                                        googleSignIn: true,
                                        link: infos.link,
                                        picture: infos.picture
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
            bookAPI[request](query, function (err, response) { if (!!err) { defReq.reject(err); } else { defReq.resolve(response); } });
            return defReq.promise;
        },
        searchLoop = function (fn, param) {
            param.startIndex = 0;
            lastSearch = [];
            var defLoop = Q.defer(),
                loop = function () {
                    bookAPI[fn](param, function (error, response) {
                        if (!!error || !response || !response.items) { defLoop.reject(error || new Error("Bad Request")); } else {
                            var books = bookAPI.formatBooks(response.items);
                            lastSearch.push(books);
                            lastSearch = _.flatten(lastSearch);
                            param.startIndex += books.length;
                            socket.emit("books", books);
                            if (books.length === 40 && param.startIndex < 400) {
                                loop();
                            } else {
                                defLoop.resolve(param.startIndex);
                            }
                        }
                    });
            };
            loop();
            return defLoop.promise;
        },
        connecting = function () {};

    socket.on("isConnected", function () {
        console.log("sessionId", sessionId);
        currUser(sessionId)
            .then(function (userInfos) {
                userAPI.findUser(userInfos.username)
                    .catch(function (err) {
                        if (!!userInfos.googleSignIn) {
                            userAPI.addUser(userInfos.username, userInfos.username, userInfos.name, function (err) {
                                if (!!err) {
                                    console.error(err);
                                    return socket.emit("logout", true);
                                }
                                return {
                                    _id: userInfos.username,
                                    name: userInfos.name
                                };
                            });
                        } else {
                            console.error(err || new Error("No user Data"));
                            return !1;
                        }
                    })
                    .then(function (userData) {
                        if (!userData) { return socket.emit("logout", true); }
                        thisUser = userData;
                        var booksList = _.pluck(userData.userbooks, "book"),
                            tagsList = _.countBy(_.flatten(_.compact(_.pluck(userData.userbooks, "tags")), true).sort());

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
                            tags: tagsList
                        });
                        Q.allSettled([
                            defBooks("loadNotifs", { "_id.to": thisUser._id, isnew: true }),
                            defBooks("loadBooks", { id : { $in : booksList }}),
                            defBooks("loadCovers", { "_id.user" : thisUser._id }),
                            defBooks("loadComments", { "_id.book" : { $in : booksList }})
                        ]).spread(function (Notifs, Books, Covers, Comments) {
                            var def64 = [],
                                notifs = Notifs.value || [],
                                books = Books.value || [],
                                covers = Covers.value || [],
                                comments = _.groupBy(Comments.value, function (elt) { return elt._id.book; }) || [],
                                returnTags = function (elt) { return elt.book === books[book].id; },
                                returnComments = function (elt) { return elt._id.user !== thisUser._id; },
                                returnUserComments = function (elt) { return elt._id.user === thisUser._id; },
                                returnCover = function (cover) { return cover._id && cover._id.book && cover._id.book === books[book].id; };

                            for (var book in books) {
                                var tags = _.result(_.find(userData.userbooks, returnTags), "tags"),
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
                                } else if (!!books[book].cover) { def64.push(bookAPI.loadBase64(books[book], book)); }
                            }
                            Q.allSettled(def64).then(function (results) {
                                var covers = _.map(results, "value");
                                for (var cover in covers) {
                                    if (covers[cover].index) {
                                        books[covers[cover].index].cover = covers[cover].cover;
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
                            }).catch(function (error) { console.error(error); });
                        });
                    });
            }).catch(function (error) { console.error(error); socket.emit("logout", true); });
    });

    socket.on("searchBooks", function (param) {
        searchLoop("searchBooks", param)
            .catch(function (error) { console.error(error); })
            .done(function () { socket.emit("endRequest", lastSearch.length); });
    });

    socket.on("searchDetail", function (bookid) {
        defBooks("searchOne", bookid)
            .then(function (book) {
                var defReq = [];
                if (!!book) {
                    if (!book.cover) {
                        defReq.push(defBooks("loadCovers", { _id: { user: thisUser._id, book: bookid }}));
                    } else {
                        defReq.push(bookAPI.loadBase64(book));
                    }
                }
                Q.allSettled(defReq).spread(function (response) {
                    var cover = response.value;
                    if (!!cover.cover) { book.cover = cover.cover; }
                    if (!!cover.altcolor) { book.altcolor = cover.altcolor; }
                    lastDetail = book;
                    socket.emit("returnDetail", book);
                });
            })
            .catch(function (error) { console.error(error); });
    });

    socket.on("addBook", function (bookid) {
        defBooks("addBook", bookid)
            .then(function (book) {
                userAPI.updateUser({ _id: thisUser._id }, {$addToSet: { userbooks: { book: bookid }}});
                bookAPI.loadBase64(book).then(function (response) {
                    if (!!response.cover) { book.cover = response.cover; }
                    thisBooks.push(book);
                    socket.emit("returnAdd", book);
                });
            })
            .catch(function (error) { console.error(error); });
    });

    socket.on("updateBook", function (data) {
        var defReq = [];
        if (!!data.cover && !!data.maincolor) {
            defReq.push(defBooks("updateCover", { _id: { user: thisUser._id, book: data.id }, cover: data.cover, mainColor: data.mainColor, date: new Date() }));
        }
        if (!!data.userNote || !!data.userComment) {
            var update = { _id: { user: thisUser._id, book: data.id }, date: new Date(), name: thisUser.name };
            if (!!data.userNote) { update.note = data.userNote; }
            if (!!data.userComment) { update.comment = data.userComment; }
            defReq.push(defBooks("updateComment", update));
        }
        if (!!data.tags) { defReq.push(userAPI.updateUser({ _id: thisUser._id, "userbooks.book": data.id }, {$set: { "userbooks.$.tags" : data.tags }})); }
        Q.allSettled(defReq).catch(function (err) { console.error(err); });
    });

    socket.on("removeBook", function (bookid) {
        userAPI.updateUser({ _id: thisUser._id }, {$pull: { userbooks: { book: bookid }}});
        _.remove(thisBooks, { id: bookid });
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
                console.error(error);
                socket.emit("updateOk", false);
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
                console.error(error);
                socket.emit("updateOk", false);
            });
    });
};
