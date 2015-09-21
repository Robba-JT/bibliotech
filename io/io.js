var _ = require("lodash"),
    Q = require("q"),
    usersApi = require("../db/users").UsersAPI(require("../db/database").client);

module.exports = function (io, session) {
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
        socket.request.sessionId = require("cookie-parser").signedCookie(cookies._bsession, "robba1979");
        session.store.get(socket.request.sessionId, function (error, data) {
            if (!!error || !data || (!data.token && !data.user)) { return next(new Error("Session invalide!!!")); }
            if (!!data.user) {
                usersApi.findUser(data.user).then(function (result) {
                    socket.request.user = result;
                    session.middleware(socket.request, socket.request.res, next);
                }).catch(function (error) { return next(error); });
            } else if (!!data.token) {
                var auth = gAuth();
                auth.getUserInfos(data.token, function(error, infos) {
                    if (!!error) {
                        console.error("getUsersInfo error", error);
                        auth.revokeCredentials();
                        return next(error);
                    }
                    var findUser = new Q.Promise(function (resolve, reject) {
                        usersApi.findUser(infos.email)
                            .then(resolve)
                            .catch(usersApi.addUser(infos.email, "", infos.name).then(resolve));
                    });
                    findUser.done(function (user) {
                        socket.request.client = auth.client;
                        socket.request.user = _.merge(user, { googleSignIn: true, link: infos.link, picture: infos.picture });
                        session.middleware(socket.request, socket.request.res, next);
                        var onEvent = socket.onevent;
                        socket.onevent = function () {
                            var args = arguments;
                            if (_.get(auth, "client.credentials.expiry_date") < new Date()) {
                                auth.refreshToken(function (error) {
                                    if (!error) { return onEvent.apply(socket, args); }
                                    console.error("refreshToken error", error);
                                    auth.revokeCredentials();
                                    socket.emit("logout");
                                });
                            } else {
                                onEvent.apply(socket, args);
                            }
                        };
                    });
                });
            }
        });
    }).on("connection", function (socket) {
        addNew(socket.request.user._id, socket);
        require("./main")(socket, allSessions);
    });
};
