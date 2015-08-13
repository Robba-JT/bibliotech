var express = require("express"),
    compression = require("compression"),
    json = require("express-json"),
    fs = require("fs"),
    options = {
      key: fs.readFileSync("./biblio.tech.pkey"),
      cert: fs.readFileSync("./biblio.tech.crt")
    },
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
    routes = require("./routes"),
    extconsole = require("extended-console"),
    logsApi = require("./tools/logs").LogsAPI(fs),
    mainIO = require("./io/mainIO"),
    xmlrpc = require("xmlrpc"),
    rpc = xmlrpc.createSecureClient({
        host: "rpc.gandi.net",
        port: "443",
        path: "/xmlrpc/"
    }),
    rpckey = "YugWvVNDcEioZPKDzUmpsr7a",
    domain = "biblio.tech";

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
    var mongoStore = new MongoStore({
            url: mongoUrl,
            autoRemove: "native",
            touchAfter: 24 * 3600
        });

/*    rpc.methodCall("version.info", [rpckey], function (error, response) {
        console.error("rpc error", error);
        console.log("rpc response", response);
    });*/

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
        .use(device.capture())
		.use(session({
			key: "_bsession",
			secret: "robba1979",
			resave: false,
            unset: "destroy",
			saveUninitialized: false,
			store: mongoStore,
            cookie: {
                maxAge: config.maxAge,
                secure: true
            }
		}));

    device.enableDeviceHelpers(app);

    io.of("/").use(function (connData, next) {
		if (!connData.handshake.headers.cookie) {
			next(new Error("Cookie inexistant!!!"));
		} else {
			var cookies = cookie.parse(connData.handshake.headers.cookie);
			if (!cookies._bsession) {
				next(new Error("Cookie invalide!!!"));
			} else {
				connData.handshake.sessionId = cookieParser.signedCookie(cookies._bsession, "robba1979");
                mongoStore.get(connData.handshake.sessionId, function (error, data) {
                    if (!!error) { next(new Error("Session inexistante!!!")); }
                    if (!data && !data.user && !data.token && !data.token.credentials) { next(new Error("Session invalide!!!")); }
                    connData.handshake.session = new session.Session(connData.handshake, data);
                    next();
                });
			}
		}
	}).on("connection", function (socket) { mainIO(socket, db); });

    routes(app, db);
    console.info("Express server listening on http://" + ip.address() + ":" + port);
    console.info("Express server listening on https://" + ip.address() + ":" + sPort);

    require("./db/books").BooksAPI(db).mainUpdate();
});
