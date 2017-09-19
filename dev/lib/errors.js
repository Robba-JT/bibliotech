"use strict";

;(function (ctx) {
    var Err = function Err(error) {
        this.error = error;
        this.code = error.code || "";
        this.message = error.message || error;
        this.date = new Date();
    },
        Errors = function Errors() {
        this.errors = [];
    };

    Err.prototype.show = function () {
        console.error(this.date, this.code, this.message);
    };

    Errors.prototype.add = function (msg) {
        this.errors.push(new Err(msg));
    };

    Errors.prototype.show = function () {
        _.forEach(this.errors, function (error) {
            return error.show();
        });
    };

    ctx.err = new Errors();
})(window);
