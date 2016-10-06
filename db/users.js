var bcrypt = require("bcrypt-nodejs"),
    Q = require("q"),
    _ = require("lodash");

module.exports = UsersAPI = function () {
    "use strict";

    if (!(this instanceof UsersAPI)) { return new UsersAPI(); }

    var db = require("./../tools/mongo").client,
        users = db.collection("users"),
        encryptPwd = function (password) { return bcrypt.hashSync(password); },
        findUser = function (query, callback) { users.findOne(query, callback); },
        insertUser = function (data, callback) { users.insert(data, callback); },
        updateUser = function (query, data, callback) { users.update(query, data, callback); };

    this.addUser = function (userid, password, name, googleSignIn) {
        return new Q.Promise(function (resolve, reject) {
            var user = {
                "_id": userid.toLowerCase(),
                "password": encryptPwd(password),
                "name": name || "",
                "creation": new Date(),
                "last_connect": new Date(),
                "connect_number": 0,
                "tags": [],
                "books": [],
                "orders": [],
                "userbooks": 0,
                "googleSignIn": !!googleSignIn,
                "admin": false
            };
            if (!!googleSignIn) { user.googleId = password; }
            insertUser(user, function (err, result) {
                if (!!err || !result) { reject(err || new Error("Error Database")); } else { resolve(user); }
            });
        });
    };
    this.encryptPwd = encryptPwd;
    this.findUser = function (userid) {
        return new Q.Promise(function (resolve, reject) {
            findUser({ "_id": userid.toLowerCase() }, function (err, result) {
                if (!!err || !result) { reject(err); } else { resolve(result); }
            });
        });
    };
    this.hasBook = function (user, book) {
        return new Q.Promise(function (resolve, reject) {
            users.findOne({ _id: user, "books.book": book }, function (error, success) {
                if (!!error) { return reject(error); }
                resolve(success);
            });
        });
    };
    this.mostAdded = function (bookid, user, books) {
        if (!books || !books.length) { books = []; }
        books.push(bookid);
        return new Q.Promise(function (resolve, reject) {
            users.aggregate([
                    { "$match": { "books.book": bookid, "_id": { "$ne": user }}},
                    { "$project": { "_id": false, "books.book": true }},
                    { "$unwind":  "$books" },
                    { "$group": { "_id": "$books.book", "count": { "$sum": 1 }}},
                    { "$sort": { "count": -1 }},
                    { "$match": { "_id": { "$nin": books }}},
                    { "$match": { "_id.user": { "$exists": false }}}
                ]).toArray(function (error, result) {
                    if (!!error) { return reject(error); }
                    var books = _.groupBy(result, "count"),
                        keys = _.keys(_.groupBy(result, "count")).sort(),
                        most = [],
                        mostLength = 5;

                    for (var jta = 0, lg = keys.length; jta < lg && mostLength > 0; jta++) {
                        most.push(_.map(_.sample(books[keys[jta]], mostLength), "_id"));
                        most = _.flattenDeep(most);
                        mostLength = 5 - most.length;
                    }
                    resolve(most);
                });
        });
    };
    this.removeUser = function (query, callback) { users.remove(query, callback); };
    this.updateUser = function (query, data) {
        return new Q.Promise(function (resolve, reject) {
            updateUser(query, data, function (err, result) {
                if (!!err) { reject(err); } else { resolve(result); }
            });
        });
    };
    this.validateLogin = function (userid, password, googleSignIn) {
        return new Q.Promise(function (resolve, reject) {
            findUser({ "_id": userid.toLowerCase() }, function (err, user) {
                if (!!err || !user) { reject(err); } else {
                    if (!!googleSignIn || bcrypt.compareSync(password, user.password)) {
                        resolve(user);
                    } else {
                        reject(new Error("Invalid password"));
                    }
                }
            });
        });
    };
};
