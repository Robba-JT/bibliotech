process.env.NODE_ENV = process.argv[2] || "production";

const console = require("./tools/console"),
    recluster = require("recluster"),
    path = require("path"),
    sticky = require("sticky-listen"),
    cluster = recluster(path.join(__dirname, "bibliotech.js"), {
        "readyWhen": "ready"
    }),
    config = require(path.join(__dirname, "./config"))[process.env.NODE_ENV || "production"];

//process.stdout.write("\u001b[2J\u001b[0;0H");
console.info(`Starting environment: ${process.env.NODE_ENV}`);

require("pmx").init({
    "http": true
});

require("express")().get("*", (req, res) => {
    res.redirect(require("url").format({
        "protocol": "https",
        "hostname": req.hostname,
        "port": config.securePort
    }));
}).listen(config.port, (error) => {
    if (error) {
        console.warn("app http", error);
    } else {
        console.info("http server listen on", config.port);
    }
});

cluster.run();

process.on("SIGUSR2", function () {
    console.warn("Got SIGUSR2, reloading cluster...");
    cluster.reload();
});

console.warn("spawned cluster, kill -s SIGUSR2", process.pid, "to reload");

sticky.createBalancer({
    "behindProxy": false,
    "activeWorkers": cluster.activeWorkers,
    "maxRetries": 5,
    "retryDelay": 100
}).listen(config.securePort, function () {
    console.info("Sticky balancer listening on port:", config.securePort);
});
