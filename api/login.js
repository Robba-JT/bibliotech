const mailsAPI = require("../tools/mails"),
    emitter = require("../tools/emitter"),
    _ = require("lodash"),
    passport = require("passport"),
    googleWeb = require("../google_client_config").web,
    GoogleStrategy = require("passport-google-oauth").OAuth2Strategy,
    LocalStrategy = require("passport-local").Strategy,
    usersDB = require("../db/users"),
    LoginAPI = function () {
        //Passport Configuration
        passport.serializeUser((user, done) => done(null, {
            "_id": user._id,
            "token": user.token,
            "infos": user.infos,
            "active": user.active,
            "browser_type": user.browser_type
        }));

        passport.deserializeUser((data, done) => usersDB.find(data._id).then((user) => done(null, user && _.assign(user, data))).catch(done));

        passport.use(new GoogleStrategy({
            "clientID": googleWeb.client_id,
            "clientSecret": googleWeb.client_secret,
            "callbackURL": "/googleAuth"
        }, (token, refreshToken, profile, done) => {
            const email = _.find(profile.emails, ["type", "account"]),
                raw = JSON.parse(profile._raw),
                gInfos = {
                    token,
                    refreshToken
                };

            console.log(email, raw, gInfos);

            if (!email || !email.value) {
                done(new Error("Invalid profile"));
            } else {
                if (raw && raw.image && raw.image.url && raw.url) {
                    _.assign(gInfos, {
                        "infos": {
                            "picture": raw.image.url,
                            "link": raw.url
                        }
                    });
                }
                usersDB.validate(email.value, raw.id).then((user) => {
                    done(null, _.assign(user, gInfos));
                }).catch((error) => {
                    if (error) {
                        done(error, false);
                    } else {
                        usersDB.add(email.value, raw.id, raw.displayName, true).then((newUser) => {
                            done(null, _.assign(newUser, gInfos));
                        }).catch(done);
                    }
                });
            }
        }));

        passport.use("login", new LocalStrategy({
            "usernameField": "email",
            "passwordField": "password",
            "session": false,
            "passReqToCallback": true
        }, (...args) => {
            const [
                req,
                username,
                password,
                done
            ] = args;
            usersDB.validate(username, password).then((user) => {
                done(null, _.assign(user, {
                    "active": Boolean(req.body.active)
                }));
            }).catch(done);
        }));

        passport.use("new", new LocalStrategy({
            "usernameField": "email",
            "passwordField": "password",
            "session": false,
            "passReqToCallback": true
        }, (...args) => {
            const [
                req,
                username,
                password,
                done
            ] = args;
            usersDB.add(username, password, req.body.name).then((user) => {
                done(null, _.assign(user, {
                    "active": Boolean(req.body.active)
                }));
            }).catch(done);
        }));

        this.initialize = () => passport.initialize();

        this.session = () => passport.session();

        //Google Auth
        this.gAuth = passport.authenticate("google", {
            "approvalPrompt": "force",
            "scope": ["email", "https://www.googleapis.com/auth/books"],
            "accessType": "offline"
        });

        this.googleAuth = passport.authenticate("google", {
            "failureRedirect": "/",
            "successRedirect": "/"
        });

        //Mot de passe oublié
        this.forgotten = (req, res) => {
            usersDB.find(req.body.email).then((user) => {
                const newPwd = Math.random().toString(24).slice(2);
                usersDB.update({
                    "_id": user._id
                }, {
                    "$set": {
                        "password": usersDB.encryptPwd(newPwd)
                    }
                }).then(() => {
                    console.info("new password request", user._id, newPwd, usersDB.encryptPwd(newPwd));
                    mailsAPI.sendPassword(user._id, user.name, newPwd, (error) => {
                        if (error) {
                            res.jsonp({
                                "error": req.trads.error.errorSendMail
                            });
                        } else {
                            res.jsonp({
                                "success": req.trads.error.successSendMail
                            });
                        }
                    });
                }).catch(() => {
                    res.jsonp({
                        "error": req.trads.error.errorSendMail
                    });
                });
            }).catch(() => {
                res.jsonp({
                    "error": req.trads.error.invalidCredential
                });
            });
        };

        //Création User
        this.new = (req, res, next) => {
            passport.authenticate("new", (error, user) => {
                if (error || !user) {
                    console.error("login new", error);
                    req.error(401, req.trads.error.alreadyExist);
                } else {
                    req.login(user, (err) => {
                        if (err) {
                            req.error(401, err);
                        } else {
                            req.response();
                            next();
                        }
                    });
                }
            })(req, res, next);
        };

        //Authentification
        this.auth = (req, res, next) => {
            passport.authenticate("login", (error, user) => {
                if (error || !user) {
                    req.error(401, req.trads.error.invalidCredential);
                } else {
                    console.log("req.sessions", req.sessions);
                    req.login(user, (err) => {
                        if (err) {
                            console.error("login new", err);
                            req.error(401, err);
                        } else {
                            req.response();
                            next();
                        }
                    });
                }
            })(req, res, next);
        };

        //Logout
        this.out = (req) => {
            emitter.removeByUser(req.user._id);
            req.disconnect().redirect("/");
        };

        //validate
        this.validate = (err, req, res, next) => {
            if (err) {
                console.error("error", err);
                req.error(403);
            } else if (req.isAuthenticated()) {
                next();
            } else {
                req.error(401);
            }
        };
        return this;
    };

exports = module.exports = new LoginAPI();
