"use strict";

/**
 * Ajax request constructor
 * @param {String} url url
 * @param {String} method method
 * @param {Object} headers specific headers
 * @class {Request} this request
 **/
;
(function (ctx, constr) {
    var Request = function Request(url) {
        var method = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "GET";
        var headers = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        if (this instanceof Request) {
            this.method = _.toUpper(method);
            this.headers = {};
            for (var head in headers) {
                if (_.has(headers, head)) {
                    this.headers[_.toUpper(head)] = headers[head];
                }
            }
            this.url = !_.startsWith(url, "http") && !_.startsWith(url, "/") ? "/" + url : url;
            this.req = new constr();
        } else {
            return new Request(url, method, headers);
        }
        return this;
    };

    Request.prototype.jsonToQueryString = function (params) {
        var query = "";
        var keys = _.keys(params),
            lg = keys.length - 1;

        if (_.isPlainObject(params)) {
            query += "?";
            _.forEach(keys, function (key, index) {
                query += key + "=" + params[key];
                if (index < lg) {
                    query += "&";
                }
            });
        }
        this.url += encodeURI(query);
        return this;
    };

    Request.prototype.long = function () {
        this.req.timeout = 900000;
        return this.send();
    };

    /**
     * Request sending method
     * @param {Object} data data to send
     * @returns {Promise} sending Promise
     **/
    Request.prototype.send = function (data) {
        var _this = this;

        return this.url ? new Promise(function (resolve, reject) {
            try {
                if (_this.method === "GET") {
                    _this.jsonToQueryString(data);
                } else {
                    if (!_.has(_this.headers, "CONTENT-TYPE") && _.isPlainObject(data)) {
                        _this.headers = {
                            "CONTENT-TYPE": "application/json;charset=UTF-8"
                        };
                        _this.data = JSON.stringify(data);
                    } else {
                        _this.data = data;
                    }
                }
                _this.req.open(_this.method, _this.url, true);
                _this.setHeaders();
                _this.req.addEventListener("error", reject);
                _this.req.addEventListener("readystatechange", function () {
                    if (_this.req.readyState === constr.DONE) {
                        if (_.includes([401, 403], _this.req.status)) {
                            em.emit("logout");
                        } else if (_.includes([200, 204], _this.req.status)) {
                            try {
                                resolve(JSON.parse(_this.req.response));
                            } catch (error) {
                                resolve(_this.req.responseText);
                            }
                        } else {
                            try {
                                reject(JSON.parse(_this.req.response));
                            } catch (error) {
                                reject(_this.req.responseText);
                            }
                        }
                    }
                });
                _this.req.send(_this.data);
            } catch (error) {
                reject(error);
            }
        }) : Promise.reject(new Error(["Request invalid argument", "URL parameter is missing."]));
    };

    /**
     * Set Request headers prototype
     * @returns {Request} this Request
     **/
    Request.prototype.setHeaders = function () {
        for (var header in this.headers) {
            if (_.has(this.headers, header)) {
                this.req.setRequestHeader(header, this.headers[header]);
            }
        }
        return this;
    };

    Reflect.defineProperty(Request.prototype, "response", {
        get: function get() {
            if (_.has([200, 204], this.req.status)) {
                try {
                    return JSON.parse(this.req.response);
                } catch (error) {
                    return this.req.responseText;
                }
            } else {
                return null;
            }
        }
    });

    Reflect.defineProperty(Request.prototype, "error", {
        get: function get() {
            return this.req.status !== 200 && this.req.status !== 204 && {
                "code": this.req.status,
                "error": this.req.responseText
            };
        }
    });

    ctx.req = Request;
})(window, XMLHttpRequest);
