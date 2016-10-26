"use strict";

require("nconf").argv().env().defaults({ "config": require("./config")[process.env.NODE_ENV || "production"] });

const express = require("./tools/express"),
	app = express(),
    secure_server = require("https").Server({
        "pfx": require("fs").readFileSync(require("path").join(__dirname, "/ssl/bibliotech.pfx")),
        "passphrase": require("nconf").get("config").pass_phrase
    }, app),
    console = require("./tools/console"),
    sticky = require("sticky-listen");

sticky.listen(secure_server);
process.send({ "cmd": "ready" });

require("./tools/mongo").init().then(() => {
    require("./routes")(secure_server);
    console.warn("Worker ready!");
}).catch((error) => {
    console.error("Database Error", error);
});
