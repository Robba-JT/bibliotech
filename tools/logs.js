var _ = require("lodash");

module.exports.logsAPI = logsAPI = function (fs) {
    "use strict";

    if (!(this instanceof logsAPI)) { return new logsAPI(fs); }

    var formatCurrDate = function (horo) {
            var dtSeparator = "-",
                hrSeparator = ":",
                now = new Date(),
                year = now.getFullYear(),
                month = now.getMonth() + 1,
                day = now.getDate(),
                hrs = now.getHours(),
                mins = now.getMinutes(),
                secs = now.getSeconds(),
                strDate = year + dtSeparator + ((month < 10) ? "0" : "") + month + dtSeparator + ((day < 10) ? "0" : "") + day;

            if (!!horo) {
                strDate += ((hrs < 10) ? " 0" : " ") + hrs + hrSeparator + ((mins < 10) ? "0" : "") + mins + hrSeparator +  ((secs < 10) ? "0" : "") + secs;
            }
            return strDate;
        },
        logsWrite = function () {
            var path = "logs/",
                type = arguments[0],
                file = path + type + " " + formatCurrDate() + ".log",
                log = "";

            for (var index = 0, lgArgs = arguments[1].length; index < lgArgs; index++) {
                if (!!index) { log += " "; }
                if (!!_.isObject(arguments[1][index])) {
                    log += JSON.stringify(arguments[1][index]);
                } else if (!!_.isArray(arguments[1][index])) {
                    log += arguments[1][index].join (" ");
                } else {
                    log += arguments[1][index];
                }
            }
            fs.appendFile(file, log + "\n");
        };

    this.formatCurrDate = formatCurrDate;
    this.logsWrite = logsWrite;
};
