"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

;
(function () {
    var _global = (typeof global === "undefined" ? "undefined" : _typeof(global)) === "object" && global && global.Object === Object && global,
        _self = (typeof self === "undefined" ? "undefined" : _typeof(self)) === "object" && self && self.Object === Object && self,
        ctx = _global || _self || Function("return this")(),
        Err = function Err(error) {
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
}).call(undefined);
