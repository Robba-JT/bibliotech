var MongoClient = require("mongodb").MongoClient;

module.exports.init = function (mongoUrl, callback) {
    MongoClient.connect(mongoUrl, function (err, db) {
        "use strict";
        if (!!err) { callback(err); } else {
            module.exports.BooksAPI = require("./books").BooksAPI(db);
            module.exports.UsersAPI = require("./users").UsersAPI(db);
            callback();
        }
    });
};
