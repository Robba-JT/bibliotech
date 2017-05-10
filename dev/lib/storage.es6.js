const store = (function () {
    const Store = function () {
        this.valid = Boolean(window.sessionStorage);
        this.store = window.sessionStorage;
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
                const ret = this.store.getItem(key);
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

    return new Store();
}());
