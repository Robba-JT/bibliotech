/**
 * Ajax request constructor
 * @param {String} url url
 * @param {String} method method
 * @param {Object} headers specific headers
 * @class {Request} this request
 **/
;
(function () {
    const _global = typeof global === "object" && global && global.Object === Object && global,
        _self = typeof self === "object" && self && self.Object === Object && self,
        ctx = _global || _self || Function("return this")(),
        Request = function (url, method = "GET", headers = {}) {
            if (this instanceof Request) {
                this.method = _.toUpper(method);
                this.headers = {};
                for (const head in headers) {
                    if (_.has(headers, head)) {
                        this.headers[_.toUpper(head)] = headers[head];
                    }
                }
                this.url = !_.startsWith(url, "http") && !_.startsWith(url, "/") ? `/${url}` : url;
                this.req = new XMLHttpRequest();
            } else {
                return new Request(url, method, headers);
            }
            return this;
        };

    Request.prototype.jsonToQueryString = function (params) {
        let query = "";
        const keys = _.keys(params),
            lg = keys.length - 1;

        if (_.isPlainObject(params)) {
            query += "?";
            _.forEach(keys, (key, index) => {
                query += `${key}=${params[key]}`;
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
        return this.url ? new Promise((resolve, reject) => {
            const formatError = (evt) => {
                    this.error = {
                        "state": this.req.readyState,
                        "status": this.req.status,
                        "error": this.req.responseText,
                        "type": evt.type
                    };
                    if (_.includes([401, 403], this.req.status)) {
                        em.emit("logout");
                    } else {
                        reject(this.error);
                    }
                },
                formatResponse = () => {
                    this.response = this.req.responseText;
                    try {
                        this.response = JSON.parse(this.req.response);
                    } catch (error) {}
                    resolve(this.response);
                };

            try {
                if (this.method === "GET") {
                    this.jsonToQueryString(data);
                } else {
                    if (!_.has(this.headers, "CONTENT-TYPE") && _.isPlainObject(data)) {
                        this.headers = {
                            "CONTENT-TYPE": "application/json;charset=UTF-8"
                        };
                        this.data = JSON.stringify(data);
                    } else {
                        this.data = data;
                    }
                }
                this.req.open(this.method, this.url, true);
                this.setHeaders();
                this.req.addEventListener("error", formatError);
                this.req.addEventListener("abort", formatError);
                this.req.addEventListener("timeout", formatError);
                this.req.addEventListener("load", formatResponse);
                this.req.send(this.data);
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
        for (const header in this.headers) {
            if (_.has(this.headers, header)) {
                this.req.setRequestHeader(header, this.headers[header]);
            }
        }
        return this;
    };

    ctx.req = Request;

}).call(this);
