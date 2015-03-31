var MailsAPI = require("../tools/mails").MailsAPI,
    Q = require("q"),
    ent = require("ent"),
    _ = require("lodash"),
    fs = require("fs"),
    BooksAPI = require("../db/books").BooksAPI,
    google = require("googleapis"),
    gOptions = { timeout: 5000 },
    gAuth = google.oauth2({ version: "v2" });

google.options(gOptions);

module.exports = mainIO = function (socket, db) {
    "use strict";

    var sessionDB = db.collection("sessions"),
        sessionId = socket.handshake.sessionId,
        thisUser, thisBooks, oauth2Client, lastSearch,
        userAPI = new UsersAPI(db),
        bookAPI = new BooksAPI(db),
        mailAPI = new MailsAPI(db),
        currUser = function (id) {
            var defGet = Q.defer();
            sessionDB.findOne({ _id: id }, function (err, response) {
                if (!!err || !response.session) { defGet.reject(err || new Error("No session!!!")) } else {
                    var session = JSON.parse(response.session);
                    if (!session.user && !session.token && !session.token.credentials) { defGet.reject(new Error("Invalid session!!!")) } else {
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
        defLoadBooks = function (request, query) {
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
                    if (!!error || !response || !response.items) { defLoop.reject(error || new Error("bad request")); } else {
                        var books = bookAPI.formatBooks(response.items);
                        lastSearch.push(books);
                        param.startIndex += books.length;
                        socket.emit("books", books);
                        if (books.length === 40) {
                            loop();
                        } else {
                            lastSearch = _.flatten(lastSearch);
                            defLoop.resolve(param.startIndex);
                        }
                    }
                });
            }
            loop();
            return defLoop.promise;
        };

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
                    userAPI.updateLogin(thisUser._id);
                    socket.emit("user", {
                        id: thisUser._id,
                        name: thisUser.name,
                        connex: thisUser.connect_number,
                        googleSignIn: !!userInfos.googleSignIn,
                        googleSync: thisUser.googleSync,
                        picture: userInfos.picture,
                        link: userInfos.link
                    });
                    Q.allSettled([
                        defLoadBooks("loadNotifs", { "_id.to": thisUser._id, isnew: true }),
                        defLoadBooks("loadBooks", { id : { $in : _.pluck(userData.books, "book") }}),
                        defLoadBooks("loadCovers", { "_id.user" : thisUser._id })
                    ]).spread(function (Notifs, Books, Covers) {
                        var def64 = [], notifs = Notifs.value || "", books = Books.value || [], covers = Covers.value || [];
                        for (var book in books) {
                            var tIndex = _.findIndex(userData.books, function (_book) { if (_book.book === books[book].id) { return _book; }}),
                                cIndex = _.findIndex(covers, function (cover) {
                                    if (cover._id && cover._id.book && cover._id.book === books[book].id) { return cover; }
                                });

                            books[book].tags = (tIndex !== -1) ? userData.books[tIndex].tags : [];
                            if (cIndex !== -1) {
                                if (!!books[book].cover) { bookAPI.removeCovers({ _id: { user: thisUser._id , book: books[book].id }}); } else {
                                    books[book].alternative = covers[cIndex].cover;
                                    books[book].altcolor = covers[cIndex].altcolor;
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
                        });
                    });
                });
        }).catch(function (error) { console.error(error); socket.emit("logout", true); });

    socket.on("searchBooks", function (param) { searchLoop("searchBooks", param); });
};
