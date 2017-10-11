const Q = require("q"),
    db = require("../tools/mongo").client,
    _ = require("lodash"),
    BooksDB = function () {
        if (!(this instanceof BooksDB)) {
            return new BooksDB();
        }

        const db_books = db.collection("books"),
            db_comments = db.collection("comments"),
            db_covers = db.collection("covers"),
            db_notifs = db.collection("notifications");

        this.addCover = function (data) {
            return new Q.Promise((resolve, reject) => {
                this.loadCover({
                    "base64": data.base64
                }).then((cover) => {
                    if (cover) {
                        resolve(_.get(cover, "_id"));
                    } else {
                        db_covers.insertOne(data).then((result) => {
                            resolve(result.insertedId);
                        }).catch(reject);
                    }
                }).catch();
            });
        };

        this.loadAll = (filter, projection = {}) => db_books.find(filter, projection).sort({
            "title": 1
        }).toArray();

        this.loadBooks = (filter) => db_books.find(filter).toArray();

        this.loadComments = (filter) => db_comments.find(filter).toArray();

        this.loadCover = (filter) => db_covers.findOne(filter);

        this.loadCovers = (filter) => db_covers.find(filter).toArray();

        this.loadNotifs = (filter) => db_notifs.find(filter).sort({
            "date": 1
        }).toArray();

        this.loadOne = (filter) => new Q.Promise((resolve, reject) => {
            db_books.findOne(filter).then((book) => {
                if (book) {
                    resolve(book);
                } else {
                    reject();
                }
            }).catch(reject);
        });

        this.removeOne = (filter) => db_books.remove(filter);

        this.removeComment = (comment) => db_comments.remove({
            "_id": _.get(comment, "_id")
        });

        this.removeAllComments = (userId) => db_comments.remove({
            "_id.user": userId
        });

        this.removeCovers = db_covers.remove;

        this.removeNotifs = db_notifs.remove;

        this.removeUserData = (userId) => {
            this.removeNotifs({
                "_id.to": userId
            });
            this.removeAllComments(userId);
        };

        this.update = (book) => db_books.update({
            "id": book.id
        }, {
            "$set": _.omit(book, ["alt", "base64", "isNew"])
        }, {
            "upsert": true
        });

        this.updateComment = (data) => db_comments.update({
            "_id": _.get(data, "_id")
        }, {
            "$set": data
        }, {
            "upsert": true
        });

        this.updateCover = (data) => db_covers.update({
            "_id": _.get(data, "_id")
        }, {
            "$set": data
        }, {
            "upsert": true
        });

        this.updateNotif = (data, upsert = true) => db_notifs.update({
            "_id": _.get(data, "_id")
        }, {
            "$set": data
        }, {
            upsert
        });

        return this;
    };

exports = module.exports = new BooksDB();
