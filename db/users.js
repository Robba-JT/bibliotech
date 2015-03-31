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
        deleteUser = function (query, callback) {
            users.remove(query, callback);
        },
        encryptPwd = function (password) {
            return bcrypt.hashSync(password);
        };/*,
        addUser = function (username, password, name, callback) {
            username = username.toLowerCase();
            var user = {
                _id: username,
                password: bcrypt.hashSync(password),
                name: name || "",
                creation: new Date(),
                last_connect: new Date(),
                connect_number: 0,
                lists: [],
                tags: [],
                params: [],
                books: [],
                orders: [],
                userbooks: 0
            };
            users.insert(user, function (err, result) {
                if (!! err) { return callback(err, null); }
                return callback(null, result);
            });
        },
        validateLogin = function (username, password, googleSignIn, callback) {
            var defLogin = Q.defer();
            users.findOne({ _id: username.toLowerCase() }, function (err, user) {
                if (!!err) {
                    defLogin.reject(new Error("Error Database"));
                } else if (!!user) {
                    if (!!googleSignIn || bcrypt.compareSync(password, user.password)) {
                        defLogin.resolve(user);
                    } else {
                        defLogin.reject(new Error("Invalid password"));
                    }
                } else {
                    defLogin.reject(new Error("Invalid user"));
                }
            });
            return defLogin.promise;
        },
        updateLogin = function (username, callback) {
            var updateUser = function (err, user) {
                if (!!err) { return callback(err, null); }
                if (!!user) {
                    users.update(user, { $set: { last_connect: new Date() }, $inc: { connect_number: 1 }}, function (err, exec) {
                        if (!!err) { callback(err, null); }
                        callback(null, username);
                    });
                } else {
                    var no_such_user_error = new Error();
                    no_such_user_error.no_such_user = username;
                    callback(null, null);
                }
            };
            username = username.toLowerCase();
            users.findOne({ _id: username }, updateUser);
        };*/

    this.validateLogin = function (userid, password, googleSignIn) {
        var defLogin = Q.defer();
        findUser({ "_id": userid.toLowerCase() }, function (err, result) {
            if (!!err) { defLogin.reject(new Error("Error Database")); } else if (!result) { defLogin.reject(new Error("Invalid user")); } else {
                if (!!googleSignIn || bcrypt.compareSync(password, result.password)) {
                    defLogin.resolve(userid);
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
            if (!!err) { defCreate.reject(new Error("Error Database")); } else { defCreate.resolve(userid); }
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

    this.updateLogin = function (userid) {
        var defUpdate = Q.defer();
        updateUser({ "_id": userid }, { "$set": { "last_connect": new Date() }, "$inc": { "connect_number": 1 }}, function (err, result) {
            if (!!err) { defUpdate.reject(err); } else { defUpdate.resolve(result); }
        });
        return defUpdate.promise;
    }
};
