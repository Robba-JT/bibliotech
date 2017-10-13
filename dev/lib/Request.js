"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
 * Ajax request constructor
 * @param {String} url url
 * @param {String} method method
 * @param {Object} headers specific headers
 * @class {Request} this request
 **/
;
(function () {
    var _global = (typeof global === "undefined" ? "undefined" : _typeof(global)) === "object" && global && global.Object === Object && global,
        _self = (typeof self === "undefined" ? "undefined" : _typeof(self)) === "object" && self && self.Object === Object && self,
        ctx = _global || _self || Function("return this")(),
        Request = function Request(url) {
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
            this.req = new XMLHttpRequest();
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

    Request.prototype.long = function (data) {
        this.req.timeout = 900000;
        return this.send(data);
    };

    /**
     * Request sending method
     * @param {Object} data data to send
     * @returns {Promise} sending Promise
     **/
    Request.prototype.send = function (data) {
        var _this = this;

        return this.url ? new Promise(function (resolve, reject) {
            var formatError = function formatError(evt) {
                _this.error = {
                    "state": _this.req.readyState,
                    "status": _this.req.status,
                    "error": _this.req.responseText,
                    "type": evt.type
                };
                if (_.includes([401, 403], _this.req.status)) {
                    em.emit("logout");
                } else {
                    reject(_this.error);
                }
            },
                formatResponse = function formatResponse() {
                _this.response = _this.req.responseText;
                try {
                    _this.response = JSON.parse(_this.req.response);
                } catch (error) {}
                resolve(_this.response);
            };

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
                _this.req.addEventListener("error", formatError);
                _this.req.addEventListener("abort", formatError);
                _this.req.addEventListener("timeout", formatError);
                _this.req.addEventListener("load", formatResponse);
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

    ctx.req = Request;
}).call(undefined);
