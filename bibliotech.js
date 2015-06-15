var express = require("express"),
    compression = require("compression"),
    json = require("express-json"),
    fs = require("fs"),
    app = express(),
    config = JSON.parse(fs.readFileSync("config.json"))[app.settings.env],
    port = config.port,
    cors = require("cors"),
    errorhandler = require("errorhandler"),
    bodyParser = require("body-parser"),
    cookieParser = require("cookie-parser"),
    cookie = require("express/node_modules/cookie"),
    session = require("express-session"),
    favicon = require("serve-favicon"),
    serveStatic = require("serve-static"),
    http = require("http"),
    server = http.Server(app).listen(port),
    io = require("socket.io")(server),
    path = require("path"),
    cons = require("consolidate"),
    MongoClient = require("mongodb").MongoClient,
    ip = require("ip"),
    mongoUrl = "mongodb://" + config.mongoHost + ":" + config.mongoPort + "/" + config.mongoDB,
    MongoStore = require("connect-mongo")(session),
    routes = require("./routes"),
    extconsole = require("extended-console"),
    logsApi = require("./tools/logs").LogsAPI(fs),
    mainIO = require("./io/mainIO"),
    _ = require("lodash");

console.extended.timestampFormat = "DD-MM-YYYY hh:mm:ss";
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

    app.engine("html", cons.swig)
        .set("view engine", "html")
        .set("views", path.join(__dirname + "/views"))
        .set("etag", "strong")
        .use(compression({ level : 9 }))
        .use(cors())
        .use(json())
        .use(serveStatic(path.join(__dirname, "root"), { maxAge: 864000000 }))
        .use(favicon(path.join(__dirname, "root/images/bold-icon-24.png")))
        .use(errorhandler(config.errorHandlerOptions))
        .use(bodyParser.urlencoded({ extended: false }))
		.use(bodyParser.json())
		.use(session({
			key: "_bsession",
			secret: "robba1979",
			resave: false,
            unset: "destroy",
			saveUninitialized: false,
			store: new MongoStore({
				url: mongoUrl,
				autoRemove: "native",
                touchAfter: 24 * 3600
			}),
            cookie: {
                maxAge: config.maxAge
            }
		}));

    io.use(function (connData, next) {
		if (!connData.handshake.headers.cookie) {
			next(new Error("Cookie inexistant!!!"));
		} else {
			var cookies = cookie.parse(connData.handshake.headers.cookie);
			if (!cookies._bsession) {
				next(new Error("Cookie invalide!!!"));
			} else {
				connData.handshake.sessionId = cookieParser.signedCookie(cookies._bsession, "robba1979");
				next();
			}
		}
	}).on("connection", function (socket) { mainIO(socket, db); });

    routes(app, db);
    console.info("Express server listening on " + ip.address() + ":" + port);

    //Suppression Covers non utilisées
    db.collection("covers").find().toArray(function (error, covers) {
        if (!!error) { return console.error("Covers removed", error); }
        db.collection("users").find({}, { "books.cover": true }).toArray(function (error, books) {
            if (!!error) { return console.error(error); }
            var removed = 0;
            books = _.flattenDeep(_.pluck(books, "books"));
            covers.forEach(function (result) {
                if (_.findIndex(books, { cover: result._id }) === -1) { removed++; db.collection("covers").remove({ _id: result._id }); }
            });
            console.info("Covers removed", removed);
        });
    });
});
