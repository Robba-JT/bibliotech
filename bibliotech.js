var express = require("express"),
    app = express(),
    path = require("path"),
    fs = require("fs"),
    options = { "key": fs.readFileSync("./biblio.tech.key"), "cert": fs.readFileSync("./biblio.tech.crt") },
    config = JSON.parse(fs.readFileSync("config.json"))[app.settings.env],
    port = config.port,
    sPort = config.sPort,
    bodyParser = require("body-parser"),
    session = require("./db/session")(config),
    http = require("http"),
    https = require("https"),
    server = http.Server(app).listen(port),
    sServer = https.Server(options, app).listen(sPort),
    mongoUrl = "mongodb://" + config.mongoHost + ":" + config.mongoPort + "/" + config.mongoDB,
    device = require("express-device"),
    extconsole = require("extended-console"),
    logsApi = require("./tools/logs"),
    io = require("socket.io")(sServer);

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

require("./db/database").init(mongoUrl, function (error) {
    if (!!error) { console.error("Database Error", error); throw error; }

    app.engine("html", require("consolidate").swig)
        .set("view engine", "html")
        .set("views", path.join(__dirname + "/views"))
        //.set("view cache", true)
        .set("json spaces", 1)
        .set("x-powered-by", true)
        .enable("etag").set("etag", true)
        .use(require("compression")())
        .use(require("cors")())
        .use(require("express-json")())
        .use(require("serve-static")(path.join(__dirname, "root"), { maxAge: require("ms")("10 days") }))
        .use(require("serve-favicon")(path.join(__dirname, "root/images/bold-icon-24.png")))
        .use(require("errorhandler")(config.errorHandlerOptions))
        .use(bodyParser.urlencoded({ extended: false }))
		.use(bodyParser.json())
        .use(device.capture())
        .use(session.middleware)
        .use(function (req, res, next) { if (req.secure) { next(); } else { res.redirect("https://" + req.headers.host + req.url); }})
        .use(function (req, res, next) {
            res.setHeader("X-Frame-Options", "sameorigin");
            res.setHeader("X-Content-Type-Options", "nosniff");
            res.setHeader("X-XSS-Protection", "1;mode=block");
            res.setHeader("Access-Control-Allow-Origin", "https://biblio.tech");
            next();
        });

    device.enableDeviceHelpers(app);
    require("./routes")(app);
    require("./io/io")(io, session);
});
