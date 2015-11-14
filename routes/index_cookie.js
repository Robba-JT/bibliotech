var mailsAPI = require("../tools/mails").MailsAPI(),
    db = require("../db/database").client,
    usersAPI = require("../db/users").UsersAPI(db),
    fs = require("fs"),
    admins = JSON.parse(fs.readFileSync("./tools/admins.json")).admins,
    _ = require("lodash"),
    passport = require("passport"),
    googleConfig = JSON.parse(fs.readFileSync("google_client_config.json")).web,
    trads = JSON.parse(fs.readFileSync("./tools/trads.json")),
    GoogleStrategy = require("passport-google-oauth").OAuth2Strategy,
    LocalStrategy = require("passport-local").Strategy,
    passportSocketIo = require("passport.socketio");

module.exports = exports = function (app, mongoStore, io) {
    "use strict";
    var getLang = function (request) { return trads[(!!trads[request.acceptsLanguages()[0]]) ? request.acceptsLanguages()[0] : "fr"]; };

    passport.serializeUser(function(user, done) {
        done(null, { "_id": user._id, "token": user.token, "infos": user.infos, "active": !!user.active });
    });

    passport.deserializeUser(function(data, done) {
        usersAPI.findUser(data._id)
            .then(function (user) { done(null, _.assign(user, data)); })
            .catch(function (error) { done(null, false); });
    });

    passport.use(new GoogleStrategy({
            "clientID": googleConfig.client_id,
            "clientSecret": googleConfig.client_secret,
            "callbackURL": "/googleAuth"
        },
        function(accessToken, refreshToken, params, profile, done) {
            var email = _.find(profile.emails, _.matchesProperty("type", "account")),
                raw = JSON.parse(profile._raw),
                gInfos = { "token": _.merge(params, { "refresh_token": refreshToken })};

            if (!email || !email.value) { return done(new Error("Invalid profile")); }
            if (!!raw && !!raw.image && !!raw.image.url && !!raw.url) { _.assign(gInfos, { "infos": { "picture": raw.image.url, "link": raw.url }}); }
            usersAPI.validateLogin(email.value, raw.id)
                .then(function (user) {
                    _.assign(user, gInfos);
                    done(null, user); }
                )
                .catch(function (error) {
                    if (!!error) { return done(null, false); }
                    usersAPI.addUser(email.value, raw.id, raw.displayName, true)
                        .then(function (newUser) {
                            _.assign(newUser, gInfos);
                            done(null, newUser);
                        }).catch(function (error) { done(null, false); });
                });
        }
    ));

    passport.use("login", new LocalStrategy({
            usernameField: "email",
            passwordField: "password",
            session: false,
            passReqToCallback: true
        },
        function (req, username, password, done) {
            usersAPI.validateLogin(username, password)
                .then(function (user) { done(null, _.merge(user, { "active": req.body.active })); })
                .catch(function (error) { done(null, false); });
        })
    );

    passport.use("new", new LocalStrategy({
            usernameField: "email",
            passwordField: "password",
            session: false,
            passReqToCallback: true
        },
        function (req, username, password, done) {
            usersAPI.addUser(username, password, req.body.name)
                .then(function (user) { done(null, _.merge(user, { "active": req.body.active })); })
                .catch(function (error) { done(null, false); });

        })
    );

    //Errorhandler
    app.use(function (err, req, res, next) {
			console.error(err.message, err.stack);
			res.status(500).render("error", { error: err });
        })
        .use(passport.initialize())
        .use(passport.session())

	//Maintenance url
	//	.get("*", function (req, res) { res.status(503).render("maintenance", getLang(req).maintenance);})

	//Display pages
		.get("/",
            function (req, res, next) {
                if (!req.isAuthenticated()) {
                    res.clearCookie("_bsession");
                    res.render("login", getLang(req).login);
                } else { next(); }
            },
            function (req, res) {
                res.render("bibliotech", { version: JSON.stringify(require("../package.json").version) });
            }
		)
        .get("/gAuth",
            passport.authenticate("google", {
                "approvalPrompt": "force",
                "scope": "email https://www.googleapis.com/auth/books",
                "accessType": "offline"
            })
        )
        .get("/googleAuth", passport.authenticate("google", { "failureRedirect": "/", "successRedirect": "/" }))

    //Logout
		.get("/logout", function (req, res) {
            req.logout();
            req.session.destroy(function (err) { res.status(205).redirect("/"); });
        })

    //Trads
        .get("/trad", function (req, res) { res.jsonp(getLang(req).bibliotech); })

    //Erreur url
		.get("*", function (req, res) { res.status(404).render("error", { error: "Error 404" });})

	//Login
		.post("/login", function (req, res, next) {
            passport.authenticate("login", function(err, user, info) {
                if (!user) { return res.jsonp({ "error": getLang(req).error.invalidCredential }); }
                req.login(user, function(err) { return res.jsonp({ success : !err }); });
            })(req, res, next)
        })


	//Nouvel utilisateur
		.post("/new", function (req, res, next) {
            passport.authenticate("new", function(err, user, info) {
                if (!user) { return res.jsonp({ "error": getLang(req).error.alreadyExist }); }
                req.login(user, function(err) { return res.jsonp({ success : !err }); });
            })(req, res, next)
		})

	//Mot de passe oublié
		.post("/mail", function (req, res) {
            usersAPI.findUser(req.body.email)
                .then(function (user) {
                    var newPwd = Math.random().toString(24).slice(2);
                    usersAPI.updateUser({ "_id": user._id }, { $set: { "password": usersAPI.encryptPwd(newPwd) }})
                        .then(function (result) {
                            console.info("new password request", user._id, newPwd, usersAPI.encryptPwd(newPwd));
                            mailsAPI.sendPassword(user._id, user.name, newPwd, function (error, response) {
                                if (!!error) { return res.jsonp({ "error": getLang(req).error.errorSendMail }); }
                                return res.jsonp({ "success": getLang(req).error.successSendMail });
                            });
                        }).catch(function (error) { return res.jsonp({ "error": getLang(req).error.errorSendMail }); });
                }).catch(function (error) { return res.jsonp({ "error": getLang(req).error.invalidCredential }); });
		})

    //Preview
        .post("/preview", function (req, res, next) { res.render("preview", { bookid: req.body.previewid }); });

    io.use(passportSocketIo.authorize({
        "cookieParser": require("cookie-parser"),
        "key": "_bsession",
        "secret": "robba1979",
        "store": mongoStore,
        "fail": function (data, message, error, next) { next(error); },
        "success": function (data, next) {
            passportSocketIo.filterSocketsByUser(io, function(user) {
                return user._id === data.user._id;
            }).forEach(function(socket) { socket.emit("logout"); });
            next();
        }
    })).on("connection", function (socket) {
        var onEvent = socket.onevent;
        socket.onevent = function () {
            var args = arguments;
            mongoStore.get(socket.request.sessionID, function (error, session) {
                if (!!error || !session || !!session.cookie.expires && session.cookie.expires < new Date()) { console.error(error || new Error("No session find!!!")); return socket.emit("logout"); }
                onEvent.apply(socket, args);
                if (!!socket.request.user && !socket.request.user.active) {
                    var today = new Date();
                    session.cookie.expires = today.setSeconds(today.getSeconds() + 3600);
                    mongoStore.set(socket.request.sessionID, session);
                }
            });
        };
        require("../io/main")(socket);
    });
};
