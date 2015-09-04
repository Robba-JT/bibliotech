var gapi = require("../tools/gapi");

module.exports = function (io, session) {
    "use strict";
    io.use(function (socket, next) {
        if (!socket.request.headers.cookie) { return next(new Error("Cookie inexistant!!!")); }
        var cookies = require("express/node_modules/cookie").parse(socket.request.headers.cookie);
        if (!cookies._bsession) { return next(new Error("Cookie invalide!!!")); }
        socket.request.sessionId = require("cookie-parser").signedCookie(cookies._bsession, "robba1979");
        session.store.get(socket.request.sessionId, function (error, data) {
            if (!!error || !data || (!data.user && !data.token)) { return next(new Error("Session invalide!!!")); }
            if (!!data.user) {
                gapi();
                socket.request.user = data.user;
                session.middleware(socket.request, socket.request.res, next);
            } else if (!!data.token) {
                if (!!data.token) {
                    gapi(data.token);
                    gapi.getUserInfos(function(error, infos) {
                        if (!!error || !infos) { return next(error || new Error("Token invalide!!!")); }
                        socket.request.user = { username: infos.email, name: infos.name, googleSignIn: true, link: infos.link, picture: infos.picture };
                        session.middleware(socket.request, socket.request.res, next);
                    });
                }
            }
        });
    }).on("connection", function (socket) {
        var onEvent = socket.onevent;
        socket.on("revoke", function () {
            console.log("gapi.revokeCredentials", gapi.revokeCredentials);
            gapi.revokeCredentials();
        });
        socket.onevent = function () {
            var args = arguments;
            session.store.get(socket.request.sessionId, function (error, sess) { if (!!error || !sess) { socket.emit("logout"); } else { onEvent.apply(socket, args); }});
        };
        require("./main")(socket);
    });
};
