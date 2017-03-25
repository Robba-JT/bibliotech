const _ = require("lodash"),
    console = require("better-console"),
    new_console = {},
    types = ["error", "info", "log", "trace", "warn"];

_.forEach(types, (type) => {
    new_console[type] = (...args) => Reflect.apply(console[type], console, _.concat([new Date().toLocaleString(), "-", process.pid || "SA", "-"], _.values(args)));
});

exports = module.exports = new_console;
