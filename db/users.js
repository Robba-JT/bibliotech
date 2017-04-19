const bcrypt = require("bcrypt-nodejs"),
    Q = require("q"),
    _ = require("lodash"),
    UsersDB = function () {
        if (!(this instanceof UsersDB)) {
            return new UsersDB();
        }

        const db = require("./../tools/mongo").client,
            users = db.collection("users");

        this.add = (userid, password, name, googleSignIn) => new Q.Promise((resolve, reject) => {
            const user = {
                "_id": _.toLower(userid),
                "password": bcrypt.hashSync(password),
                "name": name || "",
                "creation": new Date(),
                "last_connect": new Date(),
                "connect_number": 0,
                "tags": [],
                "books": [],
                "orders": [],
                "userbooks": 0,
                "googleSignIn": Boolean(googleSignIn),
                "googleSync": false,
                "admin": false
            };
            if (googleSignIn) {
                user.googleId = password;
            }
            users.insert(user, (err, result) => {
                if (err || !result) {
                    reject(err || new Error("Error Database"));
                } else {
                    resolve(user);
                }
            });
        });

        this.encryptPwd = (pwd) => bcrypt.encryptPwd(pwd);

        this.find = (userid) => new Q.Promise((resolve, reject) => {
            users.findOne({
                "_id": _.toLower(userid)
            }, (err, result) => {
                if (err || !result) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        this.withCover = (coverId) => new Q.Promise((resolve, reject) => {
            users.find({
                "book.alt": coverId
            }).toArray().count().then(resolve).catch(reject);
        });

        this.hasBook = (user, book) => new Q.Promise((resolve, reject) => {
            users.findOne({
                _id: user,
                "books.book": book
            }, (error, success) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(success);
                }
            });
        });

        this.mostAdded = function (id, user, books) {
            if (!books || !books.length) {
                books = [];
            }
            books.push(id);
            return new Q.Promise((resolve, reject) => {
                users.aggregate([{
                        "$match": {
                            "books.id": id,
                            "_id": {
                                "$ne": user
                            }
                        }
                    },
                    {
                        "$project": {
                            "_id": false,
                            "books.id": true
                        }
                    },
                    {
                        "$unwind": "$books"
                    },
                    {
                        "$group": {
                            "_id": "$books.id",
                            "count": {
                                "$sum": 1
                            }
                        }
                    },
                    {
                        "$sort": {
                            "count": -1
                        }
                    },
                    {
                        "$match": {
                            "$and": [{
                                "_id": {
                                    "$nin": books
                                }
                            }, {
                                "_id.user": {
                                    "$exists": false
                                }
                            }]
                        }
                    }, {
                        "$limit": 5
                    }
                ]).toArray((error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(_.map(result, "_id"));
                    }
                });
            });
        };

        this.remove = (query) => users.remove(query);

        this.update = (query, data) => new Q.Promise((resolve, reject) => {
            users.update(query, data).then(resolve).catch(reject);
        });

        this.validate = (userid, password, googleSignIn) => new Q.Promise((resolve, reject) => {
            users.findOne({
                "_id": _.toLower(userid)
            }, function (err, user) {
                if (err || !user) {
                    reject(err);
                } else if (googleSignIn || bcrypt.compareSync(password, user.password)) {
                    resolve(user);
                } else {
                    reject(new Error("Invalid password"));
                }
            });
        });

        return this;
    };

exports = module.exports = new UsersDB();
