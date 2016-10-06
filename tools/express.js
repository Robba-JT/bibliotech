const express = require("express"),
    console = require("./console"),
    body_parser = require("body-parser"),
    _ = require("lodash"),
    path = require("path"),
    device = require("express-device");


exports = module.exports = function () {
    const app = express(),
        config = require("nconf").get("config");

    app.engine("html", require("consolidate").swig)
        .set("view engine", "html")
        .set("views", path.join(__dirname, "../views"))
        //.set("view cache", true)
        .set("json spaces", 1)
        .enable("etag").set("etag", true)
        .set("x-powered-by", false)
        .use(require("compression")())
        .use(require("response-time")())
        .use(require("express-json")())
        .use(require("cors")())
        .use(body_parser.json({ "limit": "50mb" }))
        .use(body_parser.urlencoded({ "extended": true, "limit": "50mb" }))
        .use(require("serve-static")(path.join(__dirname, "../root"), { maxAge: require("ms")("10 days") }))
        .use(require("serve-favicon")(path.join(__dirname, "../root/images/bold-icon-24.png")))
        .use(device.capture())
        .use((req, res, next) => {
            if (req.secure) { next(); } else {
                console.warn("Switch to secure port", req.connection.remoteAddress);
                res.redirect("https://".concat(req.get("host")).concat(req.url));
            }
        })
        .use((req, res, next) => {
            res.setHeader("Connection", "*");
            res.setHeader("X-Content-Type-Options", "nosniff");
            res.setHeader("X-XSS-Protection", "1;mode=block");
            res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type");
            if (req.method == "OPTIONS") { req.status(200).end(); } else {

            //Gestion réponse
                req.response = (result, status) => {
                    if (typeof result === "number" && !status) {
                        status = result;
                        result = null;
                    }
                    if (!result) {
                        res.status(status || 204).end();
                    } else if (typeof result === "string") {
                        res.status(status || 200).send(result);
                    } else {
                        res.status(status || 200).jsonp(result);
                    }
                };

            //Gestion error
                req.error = (error) => {
                    var code = _.isNumber(error) ? error : _.get(error, "code");
                    if (code === 400) {
                        res.status(400).end();
                    } else if (code === 401) {
                        res.status(401).send("Invalid credentials.");
                    } else if (code === 403) {
                        res.status(403).send("User permission denied.");
                    } else if (_.indexOf([121, 11000, 409], code) !== -1) {
                        res.status(409).send("Invalid arguments");
                    } else if (code === 412) {
                        res.status(412).send("Data in use.");
                    } else {
                        res.status(500).send("Database error");
                    }
                    console.error(req.method, req.url, _.get(req, "user._id"), _.get(req, "user.email"), error);
                };

                next();
            }
        });

    if (app.get("env") === "production") {
        app.use(require("errorhandler")(config.errorHandlerOptions));
    } else {
        app.use(require("errorhandler")(config.errorHandlerOptions))
            .use(require("morgan")("dev"))
            .use((req, res, next) => {
                require("on-finished")(res, (err) => {
                    console.log(req.connection.remoteAddress, "finished request");
                });
                next();
	       });
    }

    device.enableDeviceHelpers(app);

    module.exports.app = app;

    return app;
};
