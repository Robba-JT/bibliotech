var express = require("express"),
    app = express(),
    path = require("path"),
    fs = require("fs"),
    options = { "pfx": fs.readFileSync("./ssl/biblio.tech.pfx") },
    config = JSON.parse(fs.readFileSync("config.json"))[app.settings.env],
    port = config.port,
    sPort = config.sPort,
    bodyParser = require("body-parser"),
    Session = require("express-session"),
    MongoStore = require("connect-mongo")(Session),
    http = require("http"),
    https = require("https"),
    server = http.Server(app).listen(port),
    sServer = https.Server(options, app).listen(sPort),
    mongoUrl = "mongodb://" + config.mongoHost + ":" + config.mongoPort + "/" + config.mongoDB,
    device = require("express-device"),
    io = require("socket.io")(sServer);

require("./tools/console")(app);

require("./db/database").init(mongoUrl, function (error) {
    if (!!error) { console.error("Database Error", error); throw error; }

    var mongoStore = new MongoStore({
            "url": "mongodb://" + config.mongoHost + ":" + config.mongoPort + "/" + config.mongoDB,
            "autoRemove": "native",
            "touchAfter": config.maxAge
        }),
        session = Session({
            "key": "_bsession",
            "proxy": false,
            "resave": false,
            "unset": "destroy",
            "saveUninitialized": false,
            "rolling": false,
            "store": mongoStore,
            "secret": "robba1979",
            "cookie": {
                "expires": false,
                "secure": true,
                "httpOnly": true
            }
        });

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
        .use(bodyParser.urlencoded({ extended: true }))
		.use(bodyParser.json())
        .use(device.capture())
        .use(session)
        .use(function (req, res, next) { if (req.secure) { next(); } else { res.redirect("https://" + req.headers.host + req.url); }})
        .use(function (req, res, next) {
            res.setHeader("Access-Control-Allow-Origin", "https://biblio.tech");
            res.setHeader("X-Frame-Options", "sameorigin");
            res.setHeader("X-Content-Type-Options", "nosniff");
            res.setHeader("X-XSS-Protection", "1;mode=block");
            res.setHeader("Access-Control-Allow-Methods", "GET,POST");
            next();
        });

    device.enableDeviceHelpers(app);

    require("./routes")(app, mongoStore, io);

    console.info("Environment" ,app.settings.env, "Server deployé sur les ports https:", sPort, "http:", port);
});
