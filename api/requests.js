const Q = require("q"),
    _ = require("lodash"),
    reqOptions = {
        "gzip": true,
        //"proxy": "http://CGDM-EMEA%5Cjtassin:password_20@isp-ceg.emea.cegedim.grp:3128/",
        "timeout": 5000
    },
    request = require("request"),
    RequestsAPI = function () {
        if (!(this instanceof RequestsAPI)) {
            return new RequestsAPI();
        }

        request.defaults(reqOptions);

        this.loadBase64 = function (id, url) {
            return new Q.Promise((resolve, reject) => {
                if (url) {
                    const req = request.get({
                        url,
                        "encoding": "binary"
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
                                "base64": `data:${_.get(response, "headers.content-type")};base64,${Buffer.concat(chunk).toString("base64")})`
                            }));
                        } else {
                            reject("Invalid request.");
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
