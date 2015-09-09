var _ = require("lodash");

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
            if (!!error || !data || (!data.user && !data.token)) { return next(new Error("Session invalide!!!")); }
            var auth = gAuth(data.token);
            socket.request.client = auth.client;
            if (!!data.user) {
                socket.request.user = data.user;
                session.middleware(socket.request, socket.request.res, next);
            } else if (!!data.token) {
                auth.getUserInfos(function(error, infos) {
                    if (!!error || !infos) { return next(error || new Error("Token invalide!!!")); }
                    socket.request.user = { username: infos.email, name: infos.name, googleSignIn: true, link: infos.link, picture: infos.picture };
                    session.middleware(socket.request, socket.request.res, next);
                });
            }
        });
    }).on("connection", function (socket) {
        var onEvent = socket.onevent;
        addNew(socket.request.user.username, socket);
        socket.onevent = function () {
            var args = arguments;
            session.store.get(socket.request.sessionId, function (error, sess) { if (!!error || !sess) { socket.emit("logout"); } else { onEvent.apply(socket, args); }});
        };
        require("./main")(socket);
    });
};
