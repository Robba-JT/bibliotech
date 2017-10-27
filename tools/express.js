const express = require("express"),
    console = require("./console"),
    body_parser = require("body-parser"),
    _ = require("lodash"),
    path = require("path"),
    trads = require("../trads/trads"),
    meta = require("../trads/meta"),
    version = require("../package").version,
    device = require("express-device");

exports = module.exports = (() => {
    const app = express(),
        config = require("nconf").get("config"),
        Session = require("express-session"),
        MongoStore = require("connect-mongo")(Session),
        mongoStore = new MongoStore({
            "url": config.database,
            "autoRemove": "native",
            "touchAfter": config.maxAge
        }),
        router = express.Router(),
        session = Session({
            "key": "_bsession",
            "proxy": false,
            "resave": true,
            "unset": "destroy",
            "saveUninitialized": false,
            "rolling": true,
            "store": mongoStore,
            "secret": config.passPhrase,
            "cookie": {
                "expires": false,
                "secure": true,
                "httpOnly": true,
                "sameSite": true,
                "maxAge": config.maxAge
            }
        }),
        pathStatic = path.join(__dirname, app.get("env") === "production" ? "../static" : "../dev");

    if (app.get("env") === "production") {
        app.set("view cache", true);
    } else {
        app.use(require("morgan")("dev"))
            .use((req, res, next) => {
                require("on-finished")(res, () => console.log(req.connection.remoteAddress, "finished request"));
                next();
            });
    }

    app.engine("html", require("consolidate").swig)
        .set("view engine", "html")
        .set("views", path.join(__dirname, "../static/views"))
        .set("json spaces", 1)
        .enable("etag").set("etag", true)
        .set("x-powered-by", false)
	.use(require("helmet")())
        .use(require("compression")({
            "level": 9,
            "memLevel": 9
        }))
        .use(require("response-time")())
        .use(require("express-json")())
        //.use(require("cors")())
        .use(body_parser.json({
            "limit": "50mb"
        }))
        .use(body_parser.urlencoded({
            "extended": true,
            "limit": "50mb"
        }))
        .use(require("serve-static")(pathStatic))
        .use(require("serve-favicon")(path.join(__dirname, "../static/images/favicon.png")))
        .use(session)
        .use(device.capture())
        .use((req, res, next) => {
	/*
            if (req.secure) {
                next();
            } else {
                console.warn("Switch to secure port", req.connection.remoteAddress);
                res.redirect("https://".concat(req.get("host")).concat(req.url));
            }
	*/
			console.log(req.get("host"), req.get("url"));
			if (req.secure && req.get("host") === "bookcase.tech") {
				next();
			} else {
				console.warn("Switch to secure port", req.connection.remoteAddress);
                res.redirect("https://bookcase.tech".concat(req.url));
			}
        })
        .use((req, res, next) => {
            res.set({
                "Connection": "*",
                "X-Content-Type-Options": "nosniff",
                "X-XSS-Protection": "1;mode=block",
                "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type,Transfer-Encoding",
                "Access-Control-Allow-Origin": "biblio.tech"
            });
            if (req.method == "OPTIONS") {
                req.status(200).end();
            } else {
                //Gestion écran
                const acceptLang = req.acceptsLanguages()[0],
                    lang = _.has(trads, acceptLang) ? acceptLang : "fr",
                    reqMeta = meta[lang];

                req.trads = trads[lang];
                req.render = (page, labels = {}, status) => {
                    if (_.isNumber(labels) && !status) {
                        status = labels;
                        labels = {};
                    }
                    const type = _.get(req, "device.type") || "desktop",
                        reqPath = [_.includes(["phone", "tablet"], type) ? "mobile" : "desktop", page].join("/");

                    _.assign(labels, _.get(req.trads, page), {
                        version,
                        page
                    }, reqMeta);
                    res.status(status || 200).render(reqPath, labels);
                };
                //Gestion réponse
                req.response = (result, status) => {
                    if (_.isNumber(result) && !status) {
                        status = result;
                        result = null;
                    }
                    if (!result) {
                        res.status(status || 204).end();
                    } else if (_.isString(result)) {
                        res.status(status || 200).send(result);
                    } else {
                        res.status(status || 200).json(result);
                    }
                };
                //Gestion error
                req.error = (code, error) => {
                    code = _.isNumber(code) ? code : _.get(code, "code");
                    if (code === 400) {
                        res.status(400).end();
                    } else if (code === 401) {
                        res.status(401).send(error || "Invalid credentials.");
                    } else if (code === 403) {
                        res.status(403).send(error || "Invalid session");
                    } else if (code === 404) {
                        res.status(404).end();
                    } else if (_.includes([121, 11000, 409], code)) {
                        res.status(409).send(error || "Invalid arguments");
                    } else if (code === 412) {
                        res.status(412).send(error || "Data in use.");
                    } else {
                        res.status(500).send(error || "Database error");
                    }
                    console.error(req.method, req.url, _.get(req, "user._id"), _.get(req, "user.email"), code, error);
                };
                //Gestion Template
                req.template = (template, params = {}) => {
                    const file = path.join(pathStatic, `./templates/${template}.html`);
                   res.render(file, _.assign(params, {
                        version,
                        lang
                    }, _.get(req.trads, template)), (error, html) => {
                        if (error) {
                            req.error(404, error);
                        } else {
                            res.send(_.replace(_.replace(html, /\[{/g, "{{"), /\}]/g, "}}"));
                        }
                    });
                };
                //Logout
                req.disconnect = () => {
                    req.logout();
                    res.clearCookie("_bsession");
                    return res;
                };
                next();
            }
        }).use(require("errorhandler")(_.assign({
            log(error, str, req) {
                if (error) {
                    console.error(`Error in ${req.method} - ${req.url}: ${str}`);
                    req.render("error", {
                        error
                    }, 500);
                }
            }
        }, config.errorHandlerOptions)))
        .use(router);

    device.enableDeviceHelpers(app);

    return {
        app,
        mongoStore,
        router
    };
})();
