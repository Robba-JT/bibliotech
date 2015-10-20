var util = require("util"),
    logsApi = require("./logs"),
    _ = require("lodash"),
    clc = require("cli-color");

Date.prototype.format = function () {
    "use strict";
    var year = this.getFullYear(),
        month = this.getMonth() + 1,
        day = this.getDate(),
        hour = this.getHours(),
        mins = this.getMinutes(),
        secs = this.getSeconds();

    return "[" +
        year + "-" +
        (month > 9 ? month  : "0" + month) + "-" +
        (day > 9 ? day  : "0" + day) + " " +
        (hour > 9 ? hour  : "0" + hour) + ":" +
        (mins > 9 ? mins  : "0" + mins) + ":" +
        (secs > 9 ? secs  : "0" + secs) + "]";
};

module.exports = function (app) {
    "use strict";
    var colors = {
        "log": clc.cyanBright.bold,
        "error": clc.redBright.bold,
        "warn": clc.yellowBright.bold,
        "info": clc.greenBright.bold
    };

    ["log", "info", "warn", "error"].forEach(function(name) {
        var fn = console[name];
        console[name] = function () {
            var up = "[" + name.toUpperCase().substr(0, 3) + "]",
                now = new Date().format(),
                args = [now, up];

            _.forEach(arguments, function (value, key) {
                if (typeof value !== "string") { value = util.inspect(value); }
                args.push(value);
            });
            if (app.settings.env !== "development") { logsApi.logsWrite(name, args); }
            return fn.apply(this, [colors[name](args.join(" "))]);
        };
    });
};
