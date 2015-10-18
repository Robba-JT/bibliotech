var bcrypt = require("bcrypt-nodejs"), Q = require("q");

module.exports.UsersAPI = UsersAPI = function (db) {
    "use strict";

    if (!(this instanceof UsersAPI)) { return new UsersAPI(db); }

    var users = db.collection("users"),
        findUser = function (query, callback) { users.findOne(query, callback); },
        updateUser = function (query, data, callback) { users.update(query, data, callback); },
        insertUser = function (data, callback) { users.insert(data, callback); },
        encryptPwd = function (password) { return bcrypt.hashSync(password); };

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
    this.addUser = function (userid, password, name) {
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
                "userbooks": 0
            };
            insertUser(user, function (err, result) {
                if (!!err || !result) { reject(err || new Error("Error Database")); } else { resolve(user); }
            });
        });
    };
    this.findUser = function (userid) {
        return new Q.Promise(function (resolve, reject) {
            findUser({ "_id": userid.toLowerCase() }, function (err, result) {
                if (!!err || !result) { reject(err); } else { resolve(result); }
            });
        });
    };
    this.updateUser = function (query, data) {
        return new Q.Promise(function (resolve, reject) {
            updateUser(query, data, function (err, result) {
                if (!!err) { reject(err); } else { resolve(result); }
            });
        });
    };
    this.removeUser = function (query, callback) { users.remove(query, callback); };
    this.hasBook = function (user, book, callback) { users.findOne({ _id: user, "books.book": book }, callback); };
    this.encryptPwd = encryptPwd;
};
