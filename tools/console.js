const _ = require("lodash"),
    console = require("better-console");

var new_console = {};

_.forEach(["error", "info", "log", "trace", "warn"], (type) => {
    new_console[type] = function () {
        "use strict";
        return console[type].apply(console, _.concat([new Date().toLocaleString(), "-", process.pid || "SA", "-"], _.values(arguments)));
    };
});

exports = module.exports = new_console;
