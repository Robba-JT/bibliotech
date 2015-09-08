var session = require("express-session"),
    MongoStore = require("connect-mongo")(session);

module.exports = function Session (config) {
    "use strict";

    if (!(this instanceof Session)) { return new Session(config); }

    var mongoStore = new MongoStore({ url: "mongodb://" + config.mongoHost + ":" + config.mongoPort + "/" + config.mongoDB, autoRemove: "native", touchAfter: 24 * 3600 });

    this.store = mongoStore;
    this.middleware = session({
            "key": "_bsession",
            "proxy": false,
            "resave": false,
            "unset": "destroy",
            "saveUninitialized": false,
            "store": mongoStore,
            "secret": "robba1979",
            "cookie": { "maxAge": config.maxAge, "secure": true }});
};
