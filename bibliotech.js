var express = require("express"),
    compression = require("compression"),
    json = require("express-json"),
    fs = require("fs"),
    app = express(),
    execMode = "dev",
    config = JSON.parse(fs.readFileSync("config.json"))[execMode],
    cors = require("cors"),
    errorhandler = require("errorhandler"),
    bodyParser = require("body-parser"),
    cookieParser = require("cookie-parser"),
    cookie = require("express/node_modules/cookie"),
    session = require("express-session"),
    favicon = require("serve-favicon"),
    port = config.port,
    http = require("http"),
    server = http.Server(app).listen(port),
    io = require("socket.io")(server),
    path = require("path"),
    cons = require("consolidate"),
    MongoClient = require("mongodb").MongoClient,
    mongoUrl = "mongodb://" + config.mongoHost + ":" + config.mongoPort + "/" + config.mongoDB,
    MongoStore = require("connect-mongo")(session),
    routes = require("./routes"),
    extconsole = require("extended-console"),
    ip = require("ip"),
    tools = require("./tools/logs").logsAPI(fs),
    mainIO = require("./io/mainIO");

console.extended.timestampFormat = "DD-MM-YYYY hh:mm:ss";
console.extended
	.on("inf", function () {
        "use strict";
		tools.logsWrite("info", arguments);
	}).on("log", function () {
        "use strict";
		if (execMode === "dev") { tools.logsWrite("log", arguments); }
	}).on("war", function () {
        "use strict";
		tools.logsWrite("error", arguments);
	}).on("err", function () {
        "use strict";
		tools.logsWrite("error", arguments);
	});

MongoClient.connect(mongoUrl, function (err, db) {
    "use strict";
    if (err) { throw err; }
    console.info("Mongo server listening on " + mongoUrl);

    app.engine("html", cons.swig)
        .set("view engine", "html")
        .set("views", path.join(__dirname + "/views"))
        .use(errorhandler(config.errorHandlerOptions))
        .use(cors())
        .use(compression())
        .use(json())
        .use(bodyParser.urlencoded({ extended: false }))
		.use(bodyParser.json())
        .use(express.static(path.join(__dirname, "root")))
		.use(session({
			key: "_bsession",
			secret: "robba1979",
			resave: false,
			saveUninitialized: false,
            maxAge: config.maxAge,
			store: new MongoStore({
				url: mongoUrl,
				autoRemove: "native"
			})
		}))
        .use(favicon(path.join(__dirname, "root/images/iconmonstr-bold-icon-24.png")));

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
});
