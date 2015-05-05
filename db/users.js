var bcrypt = require("bcrypt-nodejs"),
    Q = require("q");

module.exports.UsersAPI = UsersAPI = function (db) {
    "use strict";

    if (!(this instanceof UsersAPI)) { return new UsersAPI(db); }
    var users = db.collection("users"),
        findUser = function (query, callback) {
            users.findOne(query, callback);
        },
        updateUser = function (query, data, callback) {
            users.update(query, data, callback);
        },
        insertUser = function (data, callback) {
            users.insert(data, callback);
        },
        encryptPwd = function (password) {
            return bcrypt.hashSync(password);
        };

    this.validateLogin = function (userid, password, googleSignIn) {
        var defLogin = Q.defer();
        findUser({ "_id": userid.toLowerCase() }, function (err, response) {
            if (!!err) { defLogin.reject(new Error("Error Database")); } else if (!response) { defLogin.reject(new Error("Invalid user")); } else {
                if (!!googleSignIn || bcrypt.compareSync(password, response.password)) {
                    defLogin.resolve(response);
                } else {
                    defLogin.reject(new Error("Invalid password"));
                }
            }
        });
        return defLogin.promise;
    };

    this.addUser = function (userid, password, name) {
        var defCreate = Q.defer(),
            user = {
                "_id": userid.toLowerCase(),
                "password": encryptPwd(password),
                "name": name || "",
                "creation": new Date(),
                "last_connect": new Date(),
                "connect_number": 0,
                "lists": [],
                "tags": [],
                "params": [],
                "books": [],
                "orders": [],
                "userbooks": 0
            };
        insertUser(user, function (err, result) {
            if (!!err) { defCreate.reject(new Error("Error Database")); } else { defCreate.resolve(user); }
        });
        return defCreate.promise;
    };

    this.findUser = function (userid) {
        var defFind = Q.defer();
        findUser({ "_id": userid.toLowerCase() }, function (err, result) {
            if (!!err || !result) { defFind.reject(err || new Error("Invalid user")); } else { defFind.resolve(result); }
        });
        return defFind.promise;
    };

    this.updateUser = function (query, data) {
        var defUpdate = Q.defer();
        updateUser(query, data, function (err, result) {
            if (!!err) { defUpdate.reject(err); } else { defUpdate.resolve(result); }
        });
        return defUpdate.promise;
    };

    this.removeUser = function (query, callback) {
        users.remove(query, callback);
    };

    this.hasBook = function (user, book, callback) {
        users.findOne({ _id: user, "books.book": book }, callback);
    };

    this.encryptPwd = encryptPwd;
};
