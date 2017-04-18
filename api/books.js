const console = require("../tools/console"),
    _ = require("lodash"),
    Q = require("q"),
    booksDB = require("../db/books"),
    GoogleAPI = require("./google"),
    requestAPI = require("./requests"),
    usersDB = require("../db/users"),
    BooksAPI = function () {
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
            let tags = [];
            _.forEach(books, (book) => {
                _.assign(book, _.find(req.user.books, ["id", book.id]));
                tags = _.concat(tags, book.tags || []);
            });
            req.response({
                books,
                tags,
                "total": books.length
            });
        }).catch(req.error);

        this.cover = (req, res) => {
            const id = _.get(req, "params[0]");
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
                    requestAPI.loadImg(
                        id,
                        `http://books.google.com/books/content?id=${id}&printsec=frontcover&img=1&zoom=2&source=gbs_api`
                    ).then((result) => {
                        res.set({
                            "Content-Type": result.mime,
                            "Content-Length": result.buffer.length
                        });
                        res.send(result.buffer);
                    }).catch((error) => {
                        console.error("error", error);
                        req.error(error);
                    });
                }
            } else {
                req.error(409);
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
                    if (book.alt) {
                        usersDB.withCover(book.id).then((count) => {
                            console.log("count", count);
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
            const id = _.get(req, "params[0]");
            if (id) {
                usersDB.mostAdded(id, req.user._id, _.map(req.user.books, "book")).then((ids) => {
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
                req.template("preview", {
                    "bookid": id
                });
            } else {
                req.error(409);
            }
        };

        this.update = (req) => {
            const id = _.get(req, "params[0]"),
                book = _.find(req.user.books, ["id", id]);
            if (book && !_.isEmpty(req.body) && _.isPlainObject(req.body)) {
                const update = {},
                    proms = [];

                update["books.$.date"] = _.has(req.body, "date") && new Date(req.body.date);
                update["books.$.comment"] = _.has(req.body, "comment") && req.body.comment;
                update["books.$.tags"] = _.has(req.body, "tags") && req.body.tags;
                update["books.$.note"] = _.has(req.body, "note") && _.parseInt(req.body.note);
                if (_.has(req.body, "alt")) {
                    const base64_marker = ";base64,",
                        base64_index = req.body.alt.indexOf(base64_marker),
                        base64 = req.body.alt.substr(base64_index + base64_marker.length),
                        mime = req.body.alt.substring(5, base64_index);

                    proms.push(booksDB.addCover({
                        base64,
                        mime,
                        "palette": _.get(req.body, "palette"),
                        "date": new Date(),
                        "by": req.user._id
                    }));
                }
                Q.allSettled(proms).then((result) => {
                    if (result && result.length && result[0].state === "fulfilled") {
                        update["books.$.alt"] = result[0].value;
                    }
                    usersDB.update({
                        "_id": req.user._id,
                        "books.id": id
                    }, {
                        "$set": update
                    }).then(() => {
                        req.response();
                    }).catch(req.error);
                });
            } else {
                req.error(409);
            }
        };

        this.validate = (req, res, next, id) => {
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
