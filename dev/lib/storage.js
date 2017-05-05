"use strict";

var store = function () {
    var Store = function Store() {
        this.valid = Boolean(window.sessionStorage);
        this.store = window.sessionStorage;
    };

    Store.prototype.set = function (key, value) {
        if (this.valid) {
            if (!_.isString(key)) {
                key = CJSON.stringify(key);
            }
            this.store.setItem(key, CJSON.stringify(value));
        }
        return this;
    };

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

    Store.prototype.remove = function (key) {
        if (this.valid) {
            if (!_.isString(key)) {
                key = CJSON.stringify(key);
            }
            this.store.removeItem(key);
        }
    };

    Store.prototype.clear = function () {
        if (this.valid) {
            this.store.clear();
        }
        return this;
    };
    return new Store();
}();
