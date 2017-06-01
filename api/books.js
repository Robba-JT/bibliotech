const console = require("../tools/console"),
    mailsAPI = require("../tools/mails"),
    emitter = require("../tools/emitter"),
    _ = require("lodash"),
    Q = require("q"),
    booksDB = require("../db/books"),
    GoogleAPI = require("./google"),
    requestAPI = require("./requests"),
    usersDB = require("../db/users"),
    BooksAPI = function () {
        const insertCover = function (by, cover, palette) {
                const base64_marker = ";base64,",
                    base64_index = cover.indexOf(base64_marker),
                    base64 = cover.substr(base64_index + base64_marker.length),
                    mime = cover.substring(5, base64_index);

                return booksDB.addCover({
                    base64,
                    mime,
                    palette,
                    "date": new Date(),
                    by
                });
            },
            loadCover = function (id) {
                return new Q.Promise((resolve, reject) => {
                    if (!id) {
                        reject(404);
                    } else {
                        booksDB.loadCover({
                            "_id": id
                        }).then((cover) => {
                            if (cover) {
                                cover.buffer = Buffer.from(cover.base64, "base64");
                                resolve(cover);
                            } else {
                                reject(404);
                            }
                        }).catch(() => reject(404));
                    }
                });
            },
            sendCover = function (cover, res) {
                res.set({
                    "Content-Type": cover.mime,
                    "Content-Length": cover.buffer.length
                });
                res.send(cover.buffer);
            };

        this.add = (req) => {
            if (req.book) {
                req.user.books.push({
                    "id": req.book.id,
                    "date": new Date(),
                    "tags": [],
                    "comment": ""
                });
                usersDB.update({
                    "_id": req.user._id
                }, {
                    "$addToSet": {
                        "books": {
                            "id": req.book.id,
                            "@": new Date()
                        }
                    }
                }).then(() => {
                    req.response(_.omit(req.book, ["_id", "isNew"]));
                }).catch(req.error);
                if (req.book.isNew) {
                    booksDB.update(_.omit(req.book, "isNew"));
                }
            } else {
                req.error(500);
            }
        };

        this.addNotif = (req) => {
            const email = _.toLower(_.get(req, "body.recommand"));
            var id = _.get(req, "body.book");
            try {
                id = JSON.parse(id);
            } catch (error) {}
            if (!id || !email) {
                req.error(409);
            } else {
                const has = _.find(req.user.books, ["id", id]);
                if (has) {
                    req.response();
                    usersDB.hasBook(email, id).then((response) => {
                        if (!response) {
                            booksDB.loadOne({
                                id
                            }).then((book) => {
                                const notif = {
                                    "_id": {
                                        "to": email,
                                        "book": id
                                    },
                                    "from": `${req.user.name}<${req.user._id}>`,
                                    "new": true,
                                    "title": book.title,
                                    "alt": has.alt,
                                    "date": new Date()
                                };
                                booksDB.updateNotif(notif);
                                mailsAPI.sendToFriend(req.user._id, req.user.name, email, book);
                            });
                        }
                    });
                } else {
                    req.error(409);
                }
            }
        };

        this.book = (req) => req.response(req.book);

        this.collection = (req) => booksDB.loadAll({
            "id": {
                "$in": _.map(req.user.books, "id")
            }
        }, {
            "_id": false
        }).then((books) => {
            _.forEach(books, (book) => {
                _.assign(book, _.find(req.user.books, ["id", book.id]));
            });
            req.response({
                books,
                "total": books.length
            });
        }).catch(req.error);

        this.cover = (req, res) => {
            var id = _.get(req, "params[0]");
            try {
                id = JSON.parse(id);
            } catch (error) {}
            if (id) {
                const book = _.find(req.user.books, ["id", id]);
                if (!_.isEmpty(book) && book.alt) {
                    loadCover(book.alt).then((cover) => sendCover(cover, res)).catch(req.error);
                } else if (_.isPlainObject(id) && id.user !== req.user._id) {
                    usersDB.hasBook(id.user, id).then((result) => loadCover(result.alt).then((cover) => sendCover(cover, res))).catch(() => req.error(404));
                } else {
                    requestAPI.loadCover(id).then((result) => sendCover(result, res)).catch((error) => {
                        console.error("error", error);
                        req.error(404);
                    });
                }
            } else {
                req.error(409);
            }
        };

        this.create = (req) => {
            const newBook = _.get(req, "body");
            if (newBook) {
                const proms = [];
                _.assign(newBook, {
                    "id": {
                        "user": req.user._id,
                        "number": req.user.userbooks
                    }
                });
                req.user.books.push({
                    "id": newBook.id,
                    "date": new Date(),
                    "tags": [],
                    "comment": ""
                });
                proms.push(usersDB.update({
                    "_id": req.user._id
                }, {
                    "$addToSet": {
                        "books": {
                            "id": newBook.id,
                            "@": new Date()
                        }
                    },
                    "$inc": {
                        "userbooks": 1
                    }
                }));
                proms.push(booksDB.update(newBook));
                Q.allSettled(proms).then((result) => {
                    if (_.find(result, ["status", "rejected"])) {
                        req.error(500);
                    } else {
                        req.response(newBook.id);
                    }
                }).catch(req.error);
            } else {
                req.error(500);
            }
        };

        this.delete = (req) => {
            if (_.has(req, "book")) {
                usersDB.update({
                    "_id": req.user._id
                }, {
                    "$pull": {
                        "books": {
                            "id": req.book.id
                        }
                    }
                }).then(() => {
                    const book = _.remove(req.user.books, ["id", req.book.id]);
                    req.response();
                    if (_.get(req.book, "id.user") === req.user._id) {
                        usersDB.findMany({
                            "_id": {
                                "$ne": req.user._id
                            },
                            "book.id": req.book.id
                        }).then((users) => {
                            if (!users.length) {
                                booksDB.removeOne({
                                    "id": req.book.id
                                });
                            }
                        });
                    }
                    if (book.alt) {
                        usersDB.withCover(book.id).then((count) => {
                            if (!count) {
                                booksDB.removeCover({
                                    "_id": book.alt
                                });
                            }
                        });
                    }
                }).catch(req.error);
            } else {
                req.response();
            }
        };

        this.deleteNotif = (req) => {
            const book = _.get(req, "params[0]");
            if (book) {
                booksDB.updateNotif({
                    "_id": {
                        "to": req.user._id,
                        book
                    },
                    "new": false
                }, false).then(() => req.response()).catch(req.error);
            }
        };

        this.detail = (req) => {
            const id = _.get(req, "params[0]");
            if (id) {
                booksDB.loadOne({
                        id
                    }).catch(() => GoogleAPI.detail(id))
                    .then(req.response).catch(req.error);
            } else {
                req.error(409);
            }
        };

        this.mostAdded = (req) => {
            var id = _.get(req, "params[0]");
            try {
                id = JSON.parse(id);
            } catch (error) {}
            if (id) {
                usersDB.mostAdded(id, req.user._id, _.map(req.user.books, "id")).then((ids) => {
                    if (ids.length) {
                        booksDB.loadAll({
                            "id": {
                                "$in": ids
                            }
                        }, {
                            "id": true,
                            "title": true,
                            "authors": true,
                            "description": true,
                            "cover": true,
                            "_id": false
                        }).then(req.response).catch(req.error);
                    } else {
                        req.response([]);
                    }
                }).catch(req.error);
            } else {
                req.error(409);
            }
        };

        this.notification = (req) => emitter.once("notif", req.user._id, (notif) => req.response(notif));

        this.notifications = (req) => {
            booksDB.loadNotifs({
                "_id.to": req.user._id,
                "new": true
            }).then((notifs) => {
                const ids = _.map(notifs, "_id.book");
                booksDB.loadAll({
                    "id": {
                        "$in": ids
                    }
                }, {
                    "_id": false
                }).then((books) => {
                    _.forEach(notifs, (notif) => {
                        const book = _.find(books, ["id", _.get(notif, "_id.book")]);
                        _.set(book, "from", notif.from);
                        _.set(book, "detailed", true);
                        if (notif.alt) {
                            _.set(book, "cover", true);
                        }
                    });
                    req.response(books);
                }).catch(req.error);
            }).catch(req.error);
        };

        this.preview = (req) => {
            const id = _.get(req, "params[0]");
            if (id) {
                req.template("previewContent", {
                    id
                });
            } else {
                req.error(409);
            }
        };

        this.update = (req) => {
            if (!_.isEmpty(req.body) && _.isPlainObject(req.body)) {
                const update = {},
                    proms = [];

                if (_.has(req.body, "date")) {
                    update["books.$.date"] = new Date(req.body.date);
                }
                if (_.has(req.body, "comment")) {
                    update["books.$.comment"] = req.body.comment;
                }
                if (_.has(req.body, "tags")) {
                    update["books.$.tags"] = req.body.tags;
                }
                if (_.has(req.body, "note")) {
                    update["books.$.note"] = _.parseInt(req.body.note);
                }
                if (_.has(req.body, "alt")) {
                    proms.push(insertCover(req.user._id, req.body.alt, _.get(req.body, "palette")));
                }
                if (_.has(req.body, "volumeInfo")) {
                    booksDB.update(_.merge(req.body.volumeInfo, {
                        "id": req.book.id
                    }));
                }
                Q.allSettled(proms).then((result) => {
                    if (_.find(result, ["state", "fulfilled"])) {
                        update["books.$.alt"] = result[0].value;
                    }
                    if (!_.isEmpty(update)) {
                        usersDB.update({
                            "_id": req.user._id,
                            "books.id": req.book.id
                        }, {
                            "$set": update
                        }).then(() => {
                            req.response();
                        }).catch(req.error);
                    } else {
                        req.response();
                    }
                });
            } else {
                req.error(409);
            }
        };

        this.validate = (req, res, next, id) => {
            try {
                id = JSON.parse(id);
            } catch (error) {}
            booksDB.loadOne({
                    id
                }).then((book) => {
                    if (book) {
                        return book;
                    }
                    throw new Error("Unknown book");
                }).catch(() => GoogleAPI.detail(id).then((book) => book))
                .then((book) => {
                    req.book = book;
                }).done(next);
        };
        return this;
    };

exports = module.exports = new BooksAPI();
