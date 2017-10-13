"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

;
(function () {
    var _global = (typeof global === "undefined" ? "undefined" : _typeof(global)) === "object" && global && global.Object === Object && global,
        _self = (typeof self === "undefined" ? "undefined" : _typeof(self)) === "object" && self && self.Object === Object && self,
        ctx = _global || _self || Function("return this")(),
        Store = function Store() {
        this.valid = Boolean(ctx.sessionStorage);
        this.store = ctx.sessionStorage;
    };

    /**
     * clear session storage
     * @returns {Object}
     **/
    Store.prototype.clear = function () {
        if (this.valid) {
            this.store.clear();
        }
        return this;
    };

    /**
     * Get in session storage
     * @param {String} key
     * @returns {Object}
     **/
    Store.prototype.get = function (key) {
        try {
            if (this.valid) {
                if (!_.isString(key)) {
                    key = CJSON.stringify(key);
                }
                var ret = this.store.getItem(key);
                return ret && CJSON.parse(ret);
            }
        } catch (error) {
            err.add(error);
            return null;
        }
    };

    /**
     * Remove key from session storage
     * @param {String} key
     * @returns {Store}
     **/
    Store.prototype.remove = function (key) {
        if (this.valid) {
            if (!_.isString(key)) {
                key = CJSON.stringify(key);
            }
            this.store.removeItem(key);
        }
        return this;
    };

    /**
     * Set in session storage
     * @param {String} key
     * @param {Object} value
     * @returns {Store}
     **/
    Store.prototype.set = function (key, value) {
        if (this.valid) {
            if (!_.isString(key)) {
                key = CJSON.stringify(key);
            }
            this.store.setItem(key, CJSON.stringify(value));
        }
        return this;
    };

    ctx.store = new Store();
}).call(undefined);
