require("nconf").argv().env().defaults({
    "config": require("./config")[process.env.NODE_ENV || "production"]
});

const app = require("./tools/express").app,
    fs = require("fs"),
    path = require("path"),
    secureServer = require("https").Server({
        //"pfx": require("fs").readFileSync(require("path").join(__dirname, "/ssl/bibliotech.pfx")),
        //"passphrase": require("nconf").get("config").passPhrase
        "cert": fs.readFileSync(path.join(__dirname, "/ssl/fullchain.pem")),
    	"key": fs.readFileSync(path.join(__dirname, "/ssl/privkey.pem"))
    }, app),
    console = require("./tools/console"),
    sticky = require("sticky-listen");

sticky.listen(secureServer);
process.send({
    "cmd": "ready"
});

require("./tools/mongo").init().then(() => {
    require("./tools/routes");
    //require("./tools/socket")(secureServer);
    console.warn("Worker ready!");
}).catch((error) => {
    console.error("Database Error", error);
});
