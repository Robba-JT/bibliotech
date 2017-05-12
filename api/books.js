const console = require("../tools/console"),
    _ = require("lodash"),
    Q = require("q"),
    booksDB = require("../db/books"),
    GoogleAPI = require("./google"),
    requestAPI = require("./requests"),
    usersDB = require("../db/users"),
    BooksAPI = function () {
        const insertCover = function (user, cover, palette) {
            const base64_marker = ";base64,",
                base64_index = cover.indexOf(base64_marker),
                base64 = cover.substr(base64_index + base64_marker.length),
                mime = cover.substring(5, base64_index);

            return booksDB.addCover({
                base64,
                mime,
                "palette": palette,
                "date": new Date(),
                "by": user
            });
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
                if (book && book.alt) {
                    booksDB.loadCover({
                        "_id": book.alt
                    }).then((cover) => {
                        const buffer = Buffer.from(cover.base64, "base64");
                        res.set({
                            "Content-Type": cover.mime,
                            "Content-Length": buffer.length
                        });
                        res.send(buffer);
                    }).catch(req.error);
                } else {
                    requestAPI.loadCover(id).then((result) => {
                        res.set({
                            "Content-Type": result.mime,
                            "Content-Length": result.buffer.length
                        });
                        res.send(result.buffer);
                    }).catch((error) => {
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
