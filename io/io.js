var _ = require("lodash"),
    Q = require("q"),
    usersApi = require("../db/users").UsersAPI(require("../db/database").client);

module.exports = function (io, store) {
    "use strict";

    var gAuth = require("../tools/gAuth").Auth,
        allSessions = [],
        addNew = function (user, socket) {
            var toKill = _.remove(allSessions, _.matchesProperty("user", user));
            for (var jta = 0, lg = toKill.length; jta < lg; jta++) { io.to(toKill[jta].id).emit("logout"); }
            allSessions.push({ "user": user, "id": socket.id });
            socket.on("disconnect", function () { removeOne(socket.id); });
        },
        removeOne = function (id) { _.remove(allSessions, _.matchesProperty("id", id)); };

    io.use(function (socket, next) {
        if (!socket.request.headers.cookie) { return next(new Error("Cookie inexistant!!!")); }
        var cookies = require("express/node_modules/cookie").parse(socket.request.headers.cookie);
        if (!cookies._bsession) { return next(new Error("Cookie invalide!!!")); }
        var sessionId = require("cookie-parser").signedCookie(cookies._bsession, "robba1979");
        if (!sessionId) { return next(new Error("Cookie invalide!!!")); }
        store.get(sessionId, function (error, session) {
            if (!session || (!session.token && !session.user)) { return next(new Error("Session invalide!!!")); }
            socket.request.session = { "id": sessionId };
            if (!!session.user) {
                usersApi.findUser(session.user).then(function (result) {
                    _.assign(socket.request.session, { "user": result });
                    next();
                }).catch(function (error) { return next(error); });
            } else if (!!session.token) {
                gAuth(session.token).then(function (auth) {
                    if (!_.isEqual(session.token, auth.client.credentials)) {
                        _.assign(session.token, auth.client.credentials);
                        store.set(sessionId, session);
                    }
                    auth.getUserInfo(function(error, infos) {
                        if (!!error) {
                            console.error("getUsersInfo error", error);
                            delete socket.request.session;
                            return next(error);
                        }
                        var findUser = new Q.Promise(function (resolve, reject) {
                            usersApi.findUser(infos.email)
                                .then(resolve)
                                .catch(usersApi.addUser(infos.email, "", infos.name).then(resolve));
                        });
                        findUser.done(function (user) {
                            session.client = auth.client;
                            session.user = _.merge(user, { "googleSignIn": true, "link": infos.link, "picture": infos.picture });
                            _.assign(socket.request.session, session);
                            var onEvent = socket.onevent;
                            socket.on("revoke", function () { auth.revokeCredentials(); });
                            next();
                        });
                    });
                });
            }
        });
    }).on("connection", function (socket) {
        addNew(socket.request.session.user._id, socket);
        require("./main")(socket, allSessions);
    });
};
