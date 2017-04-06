const console = require("../tools/console"),
    _ = require("lodash"),
    path = require("path"),
    booksDB = require("../db/books"),
    GoogleAPI = require("./google"),
    requestAPI = require("./requests"),
    usersDB = require("../db/users"),
    BooksAPI = function () {
        this.add = (req) => {
            if (req.book) {
                req.user.books.push({
                    "id": req.book.id,
                    "date": new Date()
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
                requestAPI.loadImg(
                    id,
                    `http://books.google.com/books/content?id=${id}&printsec=frontcover&img=1&source=gbs_api`
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
                }).then(() => req.response()).catch(req.error);
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
            const id = _.get(req, "params[0]");
            if (_.some(req.user.books, ["id", id]) && !_.isEmpty(req.body) && _.isPlainObject(req.body)) {
                const update = {};
                if (_.has(req.body, "date")) {
                    update["books.$.date"] = new Date(req.body.date);
                }
                if (_.has(req.body, "comment")) {
                    update["books.$.comment"] = req.body.comment || "";
                }
                if (_.has(req.body, "tags")) {
                    update["books.$.tags"] = req.body.tags || [];
                }
                if (_.has(req.body, "note")) {
                    update["books.$.note"] = _.parseInt(req.body.note) || 0;
                }
                usersDB.update({
                    "_id": req.user._id,
                    "books.id": id
                }, {
                    "$set": update
                }).then(() => req.response()).catch(req.error);
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
