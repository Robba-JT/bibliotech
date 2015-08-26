var express = require("express"),
    compression = require("compression"),
    json = require("express-json"),
    fs = require("fs"),
    options = { "key": fs.readFileSync("./biblio.tech.key"), "cert": fs.readFileSync("./biblio.tech.crt") },
    app = express(),
    config = JSON.parse(fs.readFileSync("config.json"))[app.settings.env],
    port = config.port,
    sPort = config.sPort,
    cors = require("cors"),
    errorhandler = require("errorhandler"),
    bodyParser = require("body-parser"),
    cookieParser = require("cookie-parser"),
    cookie = require("express/node_modules/cookie"),
    session = require("express-session"),
    favicon = require("serve-favicon"),
    serveStatic = require("serve-static"),
    http = require("http"),
    https = require("https"),
    server = http.Server(app).listen(port),
    sServer = https.Server(options, app).listen(sPort),
    io = require("socket.io")(sServer),
    path = require("path"),
    cons = require("consolidate"),
    MongoClient = require("mongodb").MongoClient,
    ip = require("ip"),
    mongoUrl = "mongodb://" + config.mongoHost + ":" + config.mongoPort + "/" + config.mongoDB,
    MongoStore = require("connect-mongo")(session),
    device = require("express-device"),
    extconsole = require("extended-console"),
    logsApi = require("./tools/logs").LogsAPI(fs),
    mainIO = require("./io/mainIO"),
    ms = require("ms"),
    google = require("googleapis"),
    OAuth2Client = google.auth.OAuth2,
    oauth2Client = new OAuth2Client(
        "216469168993-dqhiqllodmfovgtrmjdf2ps5kj0h1gg9.apps.googleusercontent.com",
        "lH-1TOOmmd2wNFaXOf2qY3dV",
        "postmessage"
    ),
    gAuth = google.oauth2("v2"),
    gOptions = {
        "timeout": 5000,
        /*"auth": oauth2Client,*/
        "gzip": true,
        "headers": { "Accept-Encoding": "gzip" }
    },
    UsersAPI = require("./db/users").UsersAPI,
    BooksAPI = require("./db/books").BooksAPI,
    MailsAPI = require("./tools/mails").MailsAPI,
    trads = require("./tools/trads");

google.options(gOptions);

console.extended.timestampFormat = "DD-MM-YYYY hh:mm:ss";
console.extended.showLogLevel = true;
console.extended
	.on("inf", function () {
        "use strict";
		logsApi.logsWrite("info", arguments);
	}).on("log", function () {
        "use strict";
		if (app.settings.env !== "development") { logsApi.logsWrite("log", arguments); }
	}).on("war", function () {
        "use strict";
		logsApi.logsWrite("error", arguments);
	}).on("err", function () {
        "use strict";
		logsApi.logsWrite("error", arguments);
	});

MongoClient.connect(mongoUrl, function (err, db) {
    "use strict";
    if (err) { console.error(err); throw err; }
    console.info("Mongo server listening on " + mongoUrl);

    var mongoStore = new MongoStore({ url: mongoUrl, autoRemove: "native", touchAfter: 24 * 3600 }),
        sessionMiddleware = session({
            "key": "_bsession",
            "resave": false,
            "unset": "destroy",
            "saveUninitialized": false,
            "store": mongoStore,
            "secret": "robba1979",
            "cookie": { "maxAge": config.maxAge, "secure": true }}),
        usersAPI = new UsersAPI(db),
        booksAPI = new BooksAPI(db, google.books("v1")),
        mailsAPI = new MailsAPI(),
        getLang = function (request) { return trads[(!!trads[request.acceptsLanguages()[0]]) ? request.acceptsLanguages()[0] : "fr"]; };

    io.of("/").use(function (socket, next) {
        if (!socket.request.headers.cookie) { return next(new Error("Cookie inexistant!!!")); }
        var cookies = cookie.parse(socket.request.headers.cookie);
		if (!cookies._bsession) { return next(new Error("Cookie invalide!!!")); }
        socket.request.sessionId = cookieParser.signedCookie(cookies._bsession, "robba1979");
        mongoStore.get(socket.request.sessionId, function (error, data) {
            if (!!error || !data || (!data.user && !data.token)) { return next(new Error("Session invalide!!!")); }
            if (!!data.token){
                if (!Object.keys(oauth2Client.credentials).length) { oauth2Client.setCredentials(data.token); }
                google._options.auth = oauth2Client;
                socket.on("disconnect", function () { oauth2Client.revokeCredentials(function (error) { if (!!error) { console.error(error); }}); });
            }
            if (!!data.user) { socket.request.user = data.user; return sessionMiddleware(socket.request, socket.request.res, next); }
            gAuth.userinfo.v2.me.get(oauth2Client.credentials, function (err, infos) {
                if (!!err || !infos) { return next(err || new Error("gAuth - No info")); }
                socket.request.user = { username: infos.email, name: infos.name, googleSignIn: true, link: infos.link, picture: infos.picture };
                sessionMiddleware(socket.request, socket.request.res, next);
            });
        });
    }).on("connection", function (socket) { mainIO(socket, db, google, usersAPI, booksAPI, mailsAPI); });

    app.engine("html", cons.swig)
        .set("view engine", "html")
        .set("views", path.join(__dirname + "/views"))
        //.set("view cache", true)
        .set("json spaces", 1)
        .set("x-powered-by", true)
        .enable("etag").set("etag", "strong")
        .use(compression())
        .use(cors())
        .use(json())
        .use(serveStatic(path.join(__dirname, "root"), { maxAge: ms("10 days") }))
        .use(favicon(path.join(__dirname, "root/images/bold-icon-24.png")))
        .use(errorhandler(config.errorHandlerOptions))
        .use(bodyParser.urlencoded({ extended: false }))
		.use(bodyParser.json())
        .use(device.capture())
        .use(sessionMiddleware)
        .use(function (req, res, next) { if (req.secure) { next(); } else { res.redirect("https://" + req.headers.host + req.url); }});


    device.enableDeviceHelpers(app);

    //Errorhandler
		app.use(function (err, req, res, next) {
			console.error(err.message, err.stack);
			res.status(500).render("error", { error: err });
        })
	//Display pages
		.get("/",
			function (req, res, next) {
                if (!req.session.user && !req.session.token) {
                    req.session.destroy(function (err) { res.render(res.locals.is_mobile? "mlogin" : "login", getLang(req).login); });
                } else {
                    next();
                }
			},
			function (req, res) { res.render(res.locals.is_mobile? "mbibliotech" : "bibliotech", getLang(req).bibliotech); }
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
                .then(function (user) {
                    req.session.user = { username: user._id };
                    if (!!!!req.body.o) { req.session.cookie.maxAge = null; }
                    res.jsonp({ success: !!user });
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
            mailsAPI.sendPassword(req.body.a, req.body.b, function (error, response) {
                console.error(error);
                res.jsonp({ success: !error });
            });
		})
    //Preview
        .post("/preview", function (req, res, next) { res.render("preview", { bookid: req.body.previewid }); })
    // Google Login
        .post("/googleAuth", function (req, res) {
            oauth2Client.getToken(req.body.c, function (err, token) {
                if (!!err || !token) { console.error(err || "googleAuth No token!!!"); } else { req.session.token = token; }
				res.jsonp({ success: !!token });
            });
        });

    console.info("Express server listening on http://" + ip.address() + ":" + port);
    console.info("Express server listening on https://" + ip.address() + ":" + sPort);

    //Mise à jour données en base
    booksAPI.mainUpdate();
});
