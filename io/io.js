var _ = require("lodash"),
    Q = require("q"),
    usersApi = require("../db/users").UsersAPI(require("../db/database").client);

module.exports = function (io) {
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
        var current = socket.request.session;
        if (!socket.request.headers.cookie) { return next(new Error("Cookie inexistant!!!")); }
        var cookies = require("express/node_modules/cookie").parse(socket.request.headers.cookie);
        if (!cookies._bsession) { return next(new Error("Cookie invalide!!!")); }
        var sessionId = require("cookie-parser").signedCookie(cookies._bsession, "robba1979");
        _.assign(current, { "id": sessionId });
        if (!current || !current.id || (!current.token && !current.user)) { return next(new Error("Session invalide!!!")); }
        if (!!current.user) {
            usersApi.findUser(current.user).then(function (result) {
                current.user = result;
                next();
            }).catch(function (error) { return next(error); });
        } else if (!!current.token) {
            var auth = gAuth();
            auth.getUserInfos(current.token, function(error, infos) {
                if (!!error) {
                    console.error("getUsersInfo error", error);
                    auth.revokeCredentials();
                    delete socket.request.session;
                    return next(error);
                }
                var findUser = new Q.Promise(function (resolve, reject) {
                    usersApi.findUser(infos.email)
                        .then(resolve)
                        .catch(usersApi.addUser(infos.email, "", infos.name).then(resolve));
                });
                findUser.done(function (user) {
                    current.client = auth.client;
                    current.user = _.merge(user, { "googleSignIn": true, "link": infos.link, "picture": infos.picture });
                    var onEvent = socket.onevent;
                    socket.onevent = function () {
                        var args = arguments;
                        if (_.get(auth, "client.credentials.expiry_date") < new Date()) {
                            auth.refreshToken(function (error, token) {
                                if (!error && !!token) {
                                    onEvent.apply(socket, args);
                                    //session.store.set(sessionId, _.merge(current, { "token": token }));
                                    current.token = token;
                                } else {
                                    console.error("refreshToken error", error);
                                    auth.revokeCredentials();
                                    socket.emit("logout");
                                }
                            });
                        } else {
                            onEvent.apply(socket, args);
                        }
                    };
                    next();
                });
            });
        }
    }).on("connection", function (socket) {
        addNew(socket.request.session.user._id, socket);
        require("./main")(socket, allSessions);
    });
};
