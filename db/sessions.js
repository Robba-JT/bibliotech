var crypto = require("crypto");

module.exports.SessionsAPI = SessionsAPI = function (db) {
    "use strict";

    if (!(this instanceof SessionsAPI)) {
        console.log("Warning: SessionsAPI constructor called without 'new' operator");
        return new SessionsAPI(db);
    }
    var sessions = db.collection("sessions");

    this.startSession = function (username, remember, code, callback) {
        var current_date = (new Date()).valueOf().toString(),
            random = Math.random().toString(),
            sessionid = crypto.createHash("sha1").update(current_date + random).digest("hex"),
            session = { _id: sessionid, connectionDate : new Date() };

        if (!!username) { session.username = username; session.remember = session.remember; }
        if (!!code) { session.code = code; }
        sessions.insert(session, function (err, result) { callback(err, sessionid); });
    };

    this.updateSession = function (query, data, callback) {
        sessions.update(query, data, function (err, success) {
            if (err) { return callback(err, null); }
            return callback(null, success);
        });
    };

    this.endSession = function (sessionid, callback) {
        sessions.remove({ _id: sessionid }, function (err, numRemoved) {
            callback(err);
        });
    };

    this.endSessionByUser = function (username, callback) {
        sessions.remove({ username: username }, function (err, numRemoved) {
            callback(err);
        });
    };

    this.getSessionInfos = function(sessionid, callback) {
        if (!sessionid) {
            callback(Error("Session not set"), null);
            return;
        }
        sessions.findOne({ _id: sessionid }, function(err, session) {
            if (err) return callback(err, null);
            if (!session) {
                callback(new Error("Session: " + session + " does not exist"), null);
                return;
            }
            callback(null, session);
        });
    };
};
