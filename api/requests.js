const Q = require("q"),
    _ = require("lodash"),
    reqOptions = {
        "gzip": true,
        "proxy": "http://CGDM-EMEA%5Cjtassin:password_22@isp-ceg.emea.cegedim.grp:3128/",
        "timeout": 5000
    },
    request = require("request"),
    RequestsAPI = function () {
        request.defaults(reqOptions);

        this.loadImg = function (id, url) {
            return new Q.Promise((resolve, reject) => {
                if (url) {
                    const req = request.get({
                        url,
                        "encoding": "binary",
                        "proxy": "http://CGDM-EMEA%5Cjtassin:password_22@isp-ceg.emea.cegedim.grp:3128/"
                    });
                    req.on("error", reject);
                    req.on("response", (response) => {
                        if (response.statusCode === 200) {
                            const chunk = [];
                            response.on("data", (data) => {
                                chunk.push(new Buffer(data, "binary"));
                            });
                            response.on("end", () => resolve({
                                id,
                                "mime": _.get(response, "headers.content-type"),
                                "buffer": Buffer.concat(chunk)
                            }));
                        } else {
                            reject(`Invalid request. code: ${response.statusCode} - url: ${url}`);
                        }
                    });
                } else {
                    reject("No url.");
                }
            });
        };
        return this;
    };

exports = module.exports = new RequestsAPI();
