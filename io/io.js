var _ = require("lodash"),
    Q = require("q"),
    gAuth = require("../tools/gAuth").Auth,
    usersApi = require("../db/users").UsersAPI(require("../db/database").client);

module.exports = function (io, store) {
    "use strict";

    var allSessions = [],
        addNew = function (user, socket) {
            var toKill = _.remove(allSessions, _.matchesProperty("user", user));
            for (var jta = 0, lg = toKill.length; jta < lg; jta++) { io.to(toKill[jta].id).emit("logout"); }
            allSessions.push({ "user": user, "id": socket.id });
            socket.on("disconnect", function () { removeOne(socket.id); });
        },
        removeOne = function (id) { _.remove(allSessions, _.matchesProperty("id", id)); };

    io.use(function (socket, next) {
        socket.request.session = {};
        if (!socket.request.headers.cookie) { return next(new Error("Cookie inexistant!!!")); }
        var cookies = require("express/node_modules/cookie").parse(socket.request.headers.cookie);
        if (!cookies._bsession) { return next(new Error("Cookie invalide!!!")); }
        var sessionId = require("cookie-parser").signedCookie(cookies._bsession, "robba1979");
        if (!sessionId) { return next(new Error("Cookie invalide!!!")); }
        console.log("sessionId", sessionId);
        store.get(sessionId, function (error, session) {
            if (!session || (!session.token && !session.user)) { return next(new Error("Session invalide!!!")); }
            socket.request.session.id = sessionId;
            if (!!session.user) {
                _.assign(socket.request.session, { "user": session.user });
            } else if (!!session.token) {
                gAuth(session.token)
                    .catch(function (error) { console.error(error); return next(error); })
                    .then(function (auth) {
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
                            console.log("infos.email", infos.email);
                            socket.request.session.user = infos.email;
                            socket.request.session.infos = { "googleSignIn": true, "link": infos.link, "picture": infos.picture };
                            socket.request.session.client = auth.client;
                            var onEvent = socket.onevent;
                            socket.onevent = function () {
                                var args = arguments;
                                if (!!session.cookie.expires && session.cookie.expires < new Date()) { return socket.emit("logout"); }
                                if (!_.isEmpty(auth.client.credentials)) {
                                    auth.refreshToken(function (error) {
                                        if (!!error) {
                                            console.error("refresh Token error", error);
                                            return socket.emit("logout");
                                        } else {
                                            onEvent.apply(socket, args);
                                            _.assign(session.token, auth.client.credentials);
                                            store.set(sessionId, session);
                                        }
                                    });
                                } else {
                                    onEvent.apply(socket, args);
                                }
                            };
                            socket.on("revoke", function () { auth.revokeCredentials(); });
                            next();
                        });
                    });
            }
        });
    }).on("connection", function (socket) {
        addNew(socket.request.session.user, socket);
        require("./main")(socket, allSessions);
    });
};
