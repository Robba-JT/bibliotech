var gAuth = require("../tools/gAuth"),
    getToken = gAuth.getToken,
    trads = require("../tools/trads"),
    mailsAPI = require("../tools/mails").MailsAPI(),
    db = require("../db/database").client,
    usersAPI = require("../db/users").UsersAPI(db),
    Q = require("q"),
    admins = JSON.parse(require("fs").readFileSync("./tools/admins.json")).admins,
    _ = require("lodash");

module.exports = exports = function (app, session) {
    "use strict";
    var getLang = function (request) { return trads[(!!trads[request.acceptsLanguages()[0]]) ? request.acceptsLanguages()[0] : "fr"]; };

    //Errorhandler
		app.use(function (err, req, res, next) {
			console.error(err.message, err.stack);
			res.status(500).render("error", { error: err });
        })

	//Maintenance url
	//	.get("*", function (req, res) { res.status(503).render("maintenance", getLang(req).maintenance);})

	//Display pages
		.get("/",
            function (req, res, next) {
                if (!req.session.user && !req.session.token) {
                    req.session.destroy(function () { res.render(res.locals.is_mobile? "mlogin" : "login", getLang(req).login); });
                } else {
                    if (!!req.session.user && admins.indexOf(req.session.user) !== -1) {
                        var proms = [];
                        db.collections(function (error, collection) {
                            var list = _.pluck(_.filter(collection, function (collect) { return collect.s.name.indexOf("system") !== 0 }), "s.name");
                            for (var jta = 0, lg = list.length; jta < lg; jta++) {
                                proms.push(new Q.Promise(function (resolve) { db.collection(list[jta]).find().toArray(function (error, data) { resolve(data); }); }));
                            }
                            Q.allSettled(proms).then(function (values) {
                                var results = {};
                                for (jta = 0, lg = values.length; jta < lg; jta++) { results[list[jta]] = JSON.stringify(values[jta].value); }
                                res.render("admin", results);
                            });
                        });
                    } else { next(); }
                }
            },
            function (req, res) {
                res.render(res.locals.is_mobile? "mbibliotech" : "bibliotech", getLang(req).bibliotech);
            }
		)
    //Logout
		.get("/logout", function (req, res) {
            req.session.destroy(function (err) { res.status(205).redirect("/"); });
        })
	//Erreur url
		.get("*", function (req, res) { res.status(404).render("error", { error: "Error 404" });})
	//Login
		.post("/login", function (req, res) {
			usersAPI.validateLogin(req.body.a, req.body.c, false)
                .then(function (userId) {
                    req.session.user = userId;
                    if (!!req.body.o) { req.session.cookie.maxAge = null; }
                    res.jsonp({ success: !!userId });
                })
                .catch(function (err) { res.jsonp({ "error": getLang(req).error.invalidCredential }); });
		})
	//Login
		.post("/new", function (req, res) {
			usersAPI.addUser(req.body.a, req.body.c, req.body.b)
                .then(function (user) { req.session.user = user._id; res.jsonp({ success: !!user }); })
                .catch(function (err) { res.jsonp({ "error": getLang(req).error.alreadyExist }); });
		})
	//Mot de passe oublié
		.post("/mail", function (req, res) {
            usersAPI.findUser(req.body.a)
                .then(function (user) {
                    var newPwd = Math.random().toString(24).slice(2);
                    usersAPI.updateUser({ "_id": user._id }, {$set: { "password": usersAPI.encryptPwd(newPwd) }})
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
        .post("/preview", function (req, res, next) { res.render("preview", { bookid: req.body.previewid }); })
    // Google Login
        .post("/googleAuth", function (req, res) {
            getToken(req.body.c, function (err, token) {
                if (!!err || !token) { console.error(err || "googleAuth No token!!!"); } else { req.session.token = token; }
				res.jsonp({ success: !!token });
            })
        });
};
