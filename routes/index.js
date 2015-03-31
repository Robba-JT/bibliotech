var UsersAPI = require("../db/users").UsersAPI,
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

    var users = new UsersAPI(db);

	app
	//Errorhandler
		.use(function (err, req, res, next) {
			console.error(err.message, err.stack);
			res.status(500).render("error", { error: err });
		})

	//Display pages
		.get("/",
			function (req, res, next) {
				if (!!req.session.user || !!req.session.token) {
					next();
				} else {
					res.render("login");
				}
			},
			function (req, res) {
				res.render("bibliotech");
			}
		)

    //Logout
		.get("/logout", function (req, res) {
            oauth2Client.revokeCredentials(function (err) {
                req.session.destroy(function (err) {
                    res.redirect("/");
                });
			});
		})

	//Erreur url
		.get("*", function (req, res) { res.status(404).render("error", { error: "Error 404" });})

	//Login
		.post("/login", function (req, res) {
			users.validateLogin(req.body.login, req.body.pwd, false)
                .then(function (user) { req.session.user = user; res.jsonp({ success: !!user }); })
                .catch(function (err) { res.jsonp({ error: err.message || "Invalid credentials!!!" }); });
		})

	//Login
		.post("/new", function (req, res) {
			users.addUser(req.body.login, req.body.pwd, req.body.name)
                .then(function (user) { req.session.user = user; res.jsonp({ success: !!user }); })
                .catch(function (err) { res.jsonp({ error: err.message || "Creation error!!!" }); });
		})

    //Preview
        .post("/preview", function (req, res, next) { res.render("preview", { bookid: req.body.bookid }); })

    // Google Login
        .post("/googleAuth", function (req, res) {
            oauth2Client.getToken(req.body.code, function (err, token) {
                if (!!err) { console.error(err); }
                if (!!token) {
                    oauth2Client.setCredentials(token);
                    req.session.token = oauth2Client;
                }
				res.jsonp({ success: !!token });
            });
    });
};
