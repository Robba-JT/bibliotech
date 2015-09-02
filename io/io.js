var cookie = require("express/node_modules/cookie"),
    cookieParser = require("cookie-parser"),
    mainIO = require("./main"),
    oauth = require("../tools/oauth").Oauth.get();

module.exports = function (io, session) {
    "use strict";
    io.use(function (socket, next) {
        if (!socket.request.headers.cookie) { return next(new Error("Cookie inexistant!!!")); }
        var cookies = cookie.parse(socket.request.headers.cookie);
        if (!cookies._bsession) { return next(new Error("Cookie invalide!!!")); }
        socket.request.sessionId = cookieParser.signedCookie(cookies._bsession, "robba1979");
        session.store.get(socket.request.sessionId, function (error, data) {
            if (!!error || !data || (!data.user && !data.token)) { return next(new Error("Session invalide!!!")); }
            if (!!data.user) {
                socket.request.user = data.user;
                return session.middleware(socket.request, socket.request.res, next);
            }
            if (!!data.token) {
                oauth.setCredentials(data.token);
                oauth.userInfos(function (err, infos) {
                    if (!!err || !infos) { return next(err || new Error("Token invalide!!!")); }
                    socket.request.user = { username: infos.email, name: infos.name, googleSignIn: true, link: infos.link, picture: infos.picture };
                    session.middleware(socket.request, socket.request.res, next);
                });
            }
        });
    }).on("connection", function (socket) {
        var onEvent = socket.onevent;
        socket.onevent = function () {
            var args = arguments;
            session.store.get(socket.request.sessionId, function (error, sess) { if (!!error || !sess) { socket.emit("logout"); } else { onEvent.apply(socket, args); }});
        };
        mainIO(socket);
    });
};
