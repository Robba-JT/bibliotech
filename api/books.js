const console = require("../tools/console"),
    _ = require("lodash"),
    path = require("path"),
    booksDB = require("../db/books"),
    GoogleAPI = require("./google")(),
    BooksAPI = function () {
        if (!(this instanceof BooksAPI)) {
            return new BooksAPI();
        }

        this.add = (req) => {
            console.log("req.book", req.book);
            req.response();
        };

        this.collection = (req) => {
            req.response(_.get(req, "user.books"));
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
