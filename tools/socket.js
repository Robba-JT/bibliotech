const Io = require("socket.io"),
    passportSocketIo = require("passport.socketio"),
    config = require("nconf").get("config"),
    express = require("../tools/express");

exports = module.exports = function (server) {
    const io = new Io(server, { "secure": true });

    io.of("/bibliotech").use(passportSocketIo.authorize({
        "cookieParser": require("cookie-parser"),
        "key": "_bsession",
        "secret": config.pass_phrase,
        "store": express.mongoStore,
        "fail": (data, message, error, next) => { next(error); },
        "success": (data, next) => {
            passportSocketIo.filterSocketsByUser(io, (user) => {
                return user._id === data.user._id;
            }).forEach((socket) => {
				if (socket.request.sessionID !== data.sessionID) { socket.server.nsps["/bibliotech"].emit("logout"); }
			});
            next();
        }
    })).on("connection", (socket) => {
        var onEvent = socket.onevent;

        socket.onevent = function () {
            var args = arguments;
            express.mongoStore.get(socket.request.sessionID, (error, session) => {
                if (!!error || !session || !!session.cookie.expires && session.cookie.expires < new Date()) {
                    console.error(error || new Error("No session find!!!"));
                    return socket.emit("logout");
                }
                onEvent.apply(socket, args);
                if (!!socket.request.user && !socket.request.user.active) {
                    var today = new Date();
                    session.cookie.expires = today.setSeconds(today.getSeconds() + 3600);
                    express.mongoStore.set(socket.request.sessionID, session);
                }
            });
        };

        require("../io/bibliotech")(socket);
    });

    io.of("/admin").use(passportSocketIo.authorize({
        "cookieParser": require("cookie-parser"),
        "key": "_bsession",
        "secret": config.pass_phrase,
        "store": express.mongoStore,
        "fail": (data, message, error, next) => { next(error); },
        "success": (data, next) => {
            passportSocketIo.filterSocketsByUser(io, (user) => {
                return user._id === data.user._id;
            }).forEach((socket) => { if (socket.request.sessionID !== data.sessionID) { socket.server.nsps["/admin"].emit("logout"); }});
            next();
        }
    })).on("connection", (socket) => {
        if (!socket.request.user || !socket.request.user.admin) { return socket.emit("logout"); }
        var onEvent = socket.onevent;
        socket.onevent = function () {
            var args = arguments;
            express.mongoStore.get(socket.request.sessionID, (error, session) => {
                if (!!error || !session || !!session.cookie.expires && session.cookie.expires < new Date()) {
                    console.error(error || new Error("No session find!!!"));
                    return socket.emit("logout");
                }
                onEvent.apply(socket, args);
            });
        };
        require("../io/admin")(socket);
    });
};
