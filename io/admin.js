var Q = require("q"),
    _ = require("lodash"),
    db = require("../db/database").client,
    ObjectID = require("mongodb").ObjectID,
    bcrypt = require("bcrypt-nodejs"),
    fs = require("fs");

module.exports = function main (socket) {
    "use strict";
    socket.on("isConnected", function () {
        fs.readdir("./logs", function (error, files) {
            var logs = [];
            if (!!error) { console.error("logs", error); }
            _.forEach(files, function (log) {
                var under = log.indexOf(" "),
                    extension = _.lastIndexOf(log, ".");

                logs.push({
                    _id: log,
                    type: log.substr(0, under),
                    date: log.substring(under + 1, extension),
                    file: fs.readFileSync("./logs/" + log, "utf-8")/*.split(/\r\n|\r|\n/)*/
                });
            });
            socket.emit("logs", logs);
        });
        db.collection("users").find().sort({ "_id" : 1 }).toArray(function (error, users) {
            if (!!error) { console.error("users", error); }
            socket.emit("users", users);
            var nbBooks = _.countBy(_.flattenDeep(_.map(users, function (user) { return _.map(user.books, function (elt) {
                return _.isPlainObject(elt.book) ? JSON.stringify(elt.book) : elt.book;
            }); })));
            db.collection("covers").find().toArray(function (error, covers) {
                if (!!error) { console.error("covers", error); }
                socket.emit("covers", covers);
            });
            db.collection("books").find().sort({ "title" : 1 }).toArray(function (error, books) {
                if (!!error) { console.error("books", error); }
                _.forEach(books, function (book) { book.nb = _.get(nbBooks, book.id); });
                var persos = _.remove(books, function (book) { return !!book.id.user; });
                socket.emit("books", books, persos);
                db.collection("comments").find().sort({ "_id.book" : 1 }).toArray(function (error, comments) {
                    if (!!error) { console.error("comments", error); }
                    _.forEach(comments, function (comment) {
                        comment.title = _.get(_.find(books, _.matchesProperty("id", comment._id.book)), "title");
                        comment.note = parseInt(comment.note, 10);
                    });
                    socket.emit("comments", comments);
                });
                db.collection("notifications").find().sort({ "_id.to" : 1 }).toArray(function (error, notifications) {
                    if (!!error) { console.error("notifications", error); }
                    _.forEach(notifications, function (notification) {
                        notification.title = _.get(_.find(books, _.matchesProperty("id", notification._id.book)), "title");
                    });
                    socket.emit("notifications", notifications);
                });
            });
        });

        db.collection("sessions").find().sort({ "expires" : -1 }).toArray(function (error, sessions) {
            if (!!error) { console.error("sessions", error); }
            _.forEach(sessions, function (session) { session.session = JSON.parse(session.session); });
            socket.emit("sessions", sessions);
        });

    });

    socket.on("delete", function (record) {
        if (!record || !record.collection || !record._id) { return; }
        if (!_.isPlainObject(record._id)) { record._id = new ObjectID(record._id); }
        db.collection(record.collection === "persos" ? "books" : record.collection).remove({ "_id": record._id }, function (error) {
            if (!!error) { console.error("admin delete", record.collection, record._id, error); }
        });
    });

    socket.on("update", function (record) {
        if (!record || !record.collection || !record.values || !record.values._id) { return; }
        if (record.collection === "users" && !!record.values.newPassword) {
            var newPass = bcrypt.hashSync(record.values.newPassword);
            if (record.values.password === newPass) { return;}
            record.values.password = newPass;
            delete record.values.newPassword;
        }
        delete record.values.$$hashKey;
        db.collection(record.collection).update({ "_id": record.values._id }, record.values, function (error) {
            if (!!error) { console.error("admin update", record.collection, record.values._id, error); }
        });
    });

};
