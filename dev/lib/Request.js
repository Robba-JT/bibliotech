const req = (function () {
    /**
     * Ajax request constructor
     * @param {String} url url
     * @param {String} method method
     * @param {Object} headers specific headers
     * @class {Request} this request
     **/
    const Request = function (url, method = "GET", headers = {}) {
        if (this instanceof Request) {
            this.method = _.toUpper(method);
            this.headers = {};
            for (const head in headers) {
                if (_.has(headers, head)) {
                    this.headers[_.toUpper(head)] = headers[head];
                }
            }
            this.url = encodeURI(!_.startsWith(url, "http") && !_.startsWith(url, "/") ? `/${url}` : url);
            this.req = new XMLHttpRequest();
        } else {
            return new Request(url, method, headers);
        }
        return this;
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

    /**
     * Get Request response
     * @returns {Object} this request response
     **/
    Reflect.defineProperty(Request.prototype, "response", {
        get() {
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

    /**
     * Get Request error
     * @returns {String} this request error
     **/
    Reflect.defineProperty(Request.prototype, "error", {
        get() {
            return this.req.status !== 200 && this.req.status !== 204 && this.req.responseText;
        }
    });

    /**
     * Request sending method
     * @param {Object} data data to send
     * @returns {Promise} sending Promise
     **/
    Request.prototype.send = function (data) {
        return this.url ? new Promise((resolve, reject) => {
            try {
                this.req.open(this.method, this.url, true);
                if (!_.has(this.headers, "CONTENT-TYPE") && _.isPlainObject(data)) {
                    this.headers = {
                        "CONTENT-TYPE": "application/json;charset=UTF-8"
                    };
                    this.data = JSON.stringify(data);
                } else {
                    this.data = data;
                }
                this.setHeaders();
                this.req.addEventListener("error", reject);
                this.req.addEventListener("readystatechange", () => {
                    if (this.req.readyState === XMLHttpRequest.DONE) {
                        if (this.req.status === 403) {
                            window.location.reload("/");
                        } else if (_.includes([200, 204], this.req.status)) {
                            try {
                                resolve(JSON.parse(this.req.response));
                            } catch (error) {
                                resolve(this.req.responseText);
                            }
                        } else {
                            try {
                                reject(JSON.parse(this.req.response));
                            } catch (error) {
                                reject(this.req.responseText);
                            }
                        }
                    }
                });
                this.req.send(this.data);
            } catch (error) {
                reject(error);
            }
        }) : Promise.reject(new Error(["Request invalid argument", "URL parameter is missing."]));
    };
    return Request;
})();
