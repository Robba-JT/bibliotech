var UsersAPI = require("../db/users").UsersAPI,
    trads = require("../tools/trads"),
    MailsAPI = require("../tools/mails").MailsAPI,
    google = require("googleapis"),
    OAuth2Client = google.auth.OAuth2,
    oauth2Client = new OAuth2Client(
        "216469168993-dqhiqllodmfovgtrmjdf2ps5kj0h1gg9.apps.googleusercontent.com",
        "lH-1TOOmmd2wNFaXOf2qY3dV",
        "postmessage"
    ),
    gOptions = { timeout: 5000, auth: oauth2Client };

google.options(gOptions);

module.exports = exports = function (app, db) {
    "use strict";

    var users = new UsersAPI(db),
        mails = new MailsAPI();

	app
	//Errorhandler
		.use(function (err, req, res, next) {
			console.error(err.message, err.stack);
			res.status(500).render("error", { error: err });
		})

	//Display pages
		.get("/",
			function (req, res, next) {
                var language = (!!trads[req.acceptsLanguages()[0]]) ? req.acceptsLanguages()[0] : "fr";
				if (!!req.session.user || (!!req.session.token && req.session.token.credentials.expiry_date > new Date())) {
                    next();
				} else {
                    req.session.destroy(function (err) {
                        oauth2Client.revokeCredentials(function (err) {
                            res.render("login", trads[language].login);
                        });
                    });
				}
			},
			function (req, res) {
                var language = (!!trads[req.acceptsLanguages()[0]]) ? req.acceptsLanguages()[0] : "fr";
				res.render("bibliotech", trads[language].bibliotech);
			}
		)

    //Logout
		.get("/logout", function (req, res) {
            res.clearCookie("_bsession");
            req.session.destroy(function (err) {
                oauth2Client.revokeCredentials(function (err) {
                    //res.redirect("/");
                    setTimeout(function () { res.redirect("/"); }, 1000);
                });
			 });
		})

	//Erreur url
		.get("*", function (req, res) { res.status(404).render("error", { error: "Error 404" });})

	//Login
		.post("/login", function (req, res) {
			users.validateLogin(req.body.a, req.body.c, false)
                .then(function (user) {
                    req.session.user = user._id;
                    if (!!!!req.body.o) { req.session.cookie.maxAge = null; }
                    res.jsonp({ success: !!user });
                })
                .catch(function (err) { res.jsonp({ error: err.message || "Invalid credentials!!!" }); });
		})

	//Login
		.post("/new", function (req, res) {
			users.addUser(req.body.a, req.body.c, req.body.b)
                .then(function (user) { req.session.user = user._id; res.jsonp({ success: !!user }); })
                .catch(function (err) { res.jsonp({ error: err.message || "Creation error!!!" }); });
		})

	//Mot de passe oublié
		.post("/mail", function (req, res) {
            //console.log(req.body.a, req.body.b);
            mails.sendPassword(req.body.a, req.body.b, function (error, response) {
                console.error(error);
                res.jsonp({ success: !error });
            });
		})

    //Preview
        .post("/preview", function (req, res, next) { res.render("preview", { bookid: req.body.previewid }); })

    // Google Login
        .post("/googleAuth", function (req, res) {
            oauth2Client.getToken(req.body.c, function (err, token) {
                if (!!token) {
                    oauth2Client.setCredentials(token);
                    req.session.cookie.expires = token.expiry_date;
                    req.session.token = oauth2Client;
                }
				res.jsonp({ success: !!token });
            });
    });
};
