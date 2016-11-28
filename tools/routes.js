const mailsAPI = require("../tools/mails")(),
    fs = require("fs"),
    _ = require("lodash"),
    passport = require("passport"),
    googleConfig = require("../google_client_config"),
    googleWeb = googleConfig.web,
    trads = require("../tools/trads"),
    meta = require("../tools/meta"),
    GoogleStrategy = require("passport-google-oauth").OAuth2Strategy,
    LocalStrategy = require("passport-local").Strategy,
    version = require("../package").version,
    express = require("../tools/express");

module.exports = exports = function () {
    "use strict";

    const usersAPI = require("../db/users")(),
        app = express.app;

    passport.serializeUser((user, done) => {
        done(null, { "_id": user._id, "token": user.token, "infos": user.infos, "active": !!user.active, "browser_type": user.browser_type });
    });

    passport.deserializeUser((data, done) => {
        usersAPI.findUser(data._id).then((user) => {
            done(null, _.assign(user, data));
        }).catch(done);
    });

    passport.use(new GoogleStrategy({
            "clientID": googleWeb.client_id,
            "clientSecret": googleWeb.client_secret,
            "callbackURL": "/googleAuth"
        }, (accessToken, refreshToken, params, profile, done) => {
            var email = _.find(profile.emails, _.matchesProperty("type", "account")),
                raw = JSON.parse(profile._raw),
                gInfos = { "token": _.merge(params, { "refresh_token": refreshToken })};

            if (!email || !email.value) {
                done(new Error("Invalid profile"));
            } else {
                if (!!raw && !!raw.image && !!raw.image.url && !!raw.url) {
                    _.assign(gInfos, { "infos": { "picture": raw.image.url, "link": raw.url }});
                }
                usersAPI.validateLogin(email.value, raw.id).then((user) => {
                    done(null, _.assign(user, gInfos));
                }).catch((error) => {
                    if (error) {
                        done(error, false);
                    } else {
                        usersAPI.addUser(email.value, raw.id, raw.displayName, true).then((newUser) => {
                            done(null, _.assign(newUser, gInfos));
                        }).catch(done);
                    }
                });
            }
        }
    ));

    passport.use("login", new LocalStrategy({
            usernameField: "email",
            passwordField: "password",
            session: false,
            passReqToCallback: true
        }, (req, username, password, done) => {
            usersAPI.validateLogin(username, password).then((user) => {
                done(null, _.assign(user, { "active": req.body.active }));
            }).catch(done);
        })
    );

    passport.use("new", new LocalStrategy({
            usernameField: "email",
            passwordField: "password",
            session: false,
            passReqToCallback: true
        }, (req, username, password, done) => {
            usersAPI.addUser(username, password, req.body.name).then((user) => {
                done(null, _.assign(user, { "active": req.body.active }));
            }).catch(done);
        })
    );

    //Errorhandler
    app.use(passport.initialize())
        .use(passport.session())
        .use((req, res, next) => {
            var lang = req.acceptsLanguages()[0];
            req.trads = trads[trads[lang] ? lang : "fr"];
            req.biblioRender = (view, labels, status) => {
                if (_.isNumber(labels) && !status) {
                    status = labels;
                    labels = {};
                }
                if (!labels) { labels = {}; }
				var path = [ !!_.get(req.device, "type") && ["phone", "tablet"].indexOf(_.get(req.device, "type")) !== -1 ? "mobile" : "desktop", view].join("/");
                _.assign(labels, _.merge(meta[meta[lang] ? lang : "fr"], { "version": version, "page": view }));
                res.status(status || 200).render.apply(res, [path, labels]);
            };
            next();
        }).use((error, req, res, next) => {
			console.error(error.message, error.stack);
			req.biblioRender("error", { "error": error }, 500);
        })

	//Maintenance url
		//.get("*", function (req, res) { req.biblioRender("maintenance", 503); })

	//Display pages
		.get("/",
            [(req, res, next) => {
                if (!req.isAuthenticated()) {
                    res.clearCookie();
                    req.biblioRender("login");
                } else { next(); }
            }, (req) => {
				if (req.user.admin) {
					var today = new Date();
					req.session.expires = req.session.cookie.expires = new Date(today.getTime() + 600000);
				}
                req.biblioRender(req.user.admin ? "admin" : "bibliotech");
            }]
		)

    //Google OAuth
        .get("/gAuth", passport.authenticate("google", {
            "approvalPrompt": "force",
            "scope": "email https://www.googleapis.com/auth/books",
            "accessType": "offline"
        }))
        .get("/googleAuth", passport.authenticate("google", { "failureRedirect": "/", "successRedirect": "/" }))

    //Logout
		.get("/logout", (req, res) => {
            req.logout();
			res.clearCookie("_bsession");
			req.session.destroy(() => { res.redirect("/"); });
        })

    //Erreur url
		.get("*", (req) => { req.biblioRender("error", { error: "Error 404" }, 404);})

    //Trads
        .post("/trad", (req, res) => {
            res.jsonp(fs.readFileSync(["./root/trads", req.body.lang, req.body.page + ".json"].join("/")));
        })

	//Login
		.post("/login", (req, res, next) => {
            passport.authenticate("login", (err, user) => {
                if (!user) {
                    res.jsonp({ "error": req.trads.error.invalidCredential });
                } else {
                    req.login(user, () => { return res.jsonp({ "success" : !!user }); });
                }
            })(req, res, next);
        })

	//Nouvel utilisateur
		.post("/new", (req, res, next) => {
            passport.authenticate("new", (err, user) => {
                if (!user) {
                    res.jsonp({ "error": req.trads.error.alreadyExist });
                } else {
                    req.login(user, (err) => { return res.jsonp({ "success" : !err }); });
                }
            })(req, res, next);
		})

	//Mot de passe oublié
		.post("/mail", (req, res) => {
            usersAPI.findUser(req.body.email).then((user) => {
                var newPwd = Math.random().toString(24).slice(2);
                usersAPI.updateUser({ "_id": user._id }, { "$set": { "password": usersAPI.encryptPwd(newPwd) }}).then(() => {
                    console.info("new password request", user._id, newPwd, usersAPI.encryptPwd(newPwd));
                    mailsAPI.sendPassword(user._id, user.name, newPwd, (error) => {
                        if (error) {
                            res.jsonp({ "error": req.trads.error.errorSendMail });
                        } else {
                            res.jsonp({ "success": req.trads.error.successSendMail });
                        }
                    });
                }).catch(() => { res.jsonp({ "error": req.trads.error.errorSendMail }); });
            }).catch(() => { res.jsonp({ "error": req.trads.error.invalidCredential }); });
		})

    //Preview
        .post("/preview", (req, res) => { res.render("preview", { "bookid": req.body.previewid }); });
};
