const Q = require("q"),
    _ = require("lodash"),
    reqOptions = {
        "gzip": true,
        "proxy": "http://psp.cegedim.com:3131",
        "timeout": 5000
    },
    noCover = new Buffer(require("../noCover"), "base64"),
    request = require("request"),
    RequestsAPI = function () {
        request.defaults(reqOptions);

        this.loadImg = (id, url) => new Q.Promise((resolve, reject) => {
            const req = request.get({
                url,
                "encoding": "binary",
                "proxy": "http://psp.cegedim.com:3131"
            });
            req.on("error", reject);
            req.on("response", (response) => {
                if (response.statusCode === 200) {
                    const chunk = [];
                    response.on("data", (data) => {
                        chunk.push(new Buffer(data, "binary"));
                    });
                    response.on("end", () => {
                        const buffer = Buffer.concat(chunk);
                        if (Buffer.compare(noCover, buffer) === 0) {
                            resolve();
                        } else {
                            resolve({
                                id,
                                "mime": _.get(response, "headers.content-type"),
                                buffer
                            });
                        }
                    });
                } else {
                    reject(`Invalid request. code: ${response.statusCode} - url: ${url}`);
                }
            });
        });

        this.loadCover = (id) => new Q.Promise((resolve, reject) => {
            this.loadImg(id, `http://books.google.com/books/content?id=${id}&printsec=frontcover&img=1&zoom=2&source=gbs_api`).then((result) => {
                if (result) {
                    resolve(result);
                } else {
                    this.loadImg(id, `http://books.google.com/books/content?id=${id}&printsec=frontcover&img=1&zoom=1&source=gbs_api`).then(resolve).catch(reject);
                }
            }).catch(reject);
        });

        return this;
    };

exports = module.exports = new RequestsAPI();
