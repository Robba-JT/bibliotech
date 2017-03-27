const console = require("../tools/console"),
    _ = require("lodash"),
    path = require("path"),
    booksDB = require("../db/books"),
    GoogleAPI = require("./google")(),
    requestAPI = require("./requests"),
    BooksAPI = function () {
        if (!(this instanceof BooksAPI)) {
            return new BooksAPI();
        }

        this.add = (req) => {
            console.log("req.book", req.book);
            req.response();
        };

        this.collection = (req) => booksDB.loadAll({
            "id": {
                "$in": _.map(req.user.books, "book")
            }
        }).then(req.response).catch(req.error);

        this.cover = (req, res) => {
            const id = _.get(req, "params[0]");
            if (id) {
                requestAPI.base64(
                    id,
                    //"url": `http://books.google.com/books/content?id=${id}&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api`
                    `http://books.google.com/books/content?id=${id}&printsec=frontcover&img=-1&source=gbs_api`
                ).then((result) => {
                    //req.response(result.base64);
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

        this.delete = (req) => req.response("delete");

        this.detail = (req) => {
            const id = _.get(req, "params[0]");
            if (id) {
                GoogleAPI.detail(id).then(req.response).catch(req.error);
            } else {
                req.error(409);
            }
        };

        this.book = (req) => req.response(req.book);

        this.validate = (req, res, next, book) => {
            if (_.includes(_.get(req, "user.books"), book)) {
                booksDB.loadOne({
                    "id": book
                }).then((result) => {
                    req.book = result;
                    next();
                }).catch(req.error);
            } else {
                next();
            }
        };

        this.template = (req) => {
            const template = _.get(req, "params[0]");
            if (template) {
                req.template(template);
            } else {
                req.error(404);
            }
        };

        return this;
    };

exports = module.exports = new BooksAPI();
