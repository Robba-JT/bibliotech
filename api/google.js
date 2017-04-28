const console = require("../tools/console"),
    Q = require("q"),
    _ = require("lodash"),
    googleConfig = require("../google_client_config"),
    google = require("googleapis"),
    gAuth = google.auth.OAuth2,
    gBooks = google.books("v1"),
    RequestsAPI = require("./requests"),
    url = require("url"),
    gOptions = {
        "gzip": true,
        "proxy": "http://CGDM-EMEA%5Cjtassin:password_23@isp-ceg.emea.cegedim.grp:3128/",
        "headers": {
            "Accept-Encoding": "gzip",
            "Content-Type": "application/json"
        }
    },
    GoogleAPI = function () {
        const maxResult = 400,
            reqParams = {
                "searchOne": {
                    "fields": "id, etag, accessInfo(accessViewStatus), volumeInfo(title, subtitle, authors, publisher, publishedDate, description, industryIdentifiers, pageCount, categories, imageLinks, canonicalVolumeLink, previewLink)",
                    "projection": "full"
                },
                "search": {
                    "maxResults": 40,
                    "fields": "totalItems, items(id, etag, accessInfo(accessViewStatus), volumeInfo(title, authors, description, imageLinks, previewLink))",
                    "projection": "lite",
                    "order": "relevance",
                    "printType": "books"
                },
                "import": {
                    "maxResults": 40,
                    "shelf": 7,
                    "fields": "items(id)",
                    "projection": "lite",
                    "printType": "books"
                }
            },
            format = (book) => {
                const bookInfos = _.get(book, "volumeInfo") || {},
                    industryIdentifiers = _.get(bookInfos, "industryIdentifiers") || {};

                return {
                    "id": book.id,
                    "title": bookInfos.title || "",
                    "subtitle": bookInfos.subtitle || "",
                    "authors": bookInfos.authors && bookInfos.authors.length ? bookInfos.authors.sort().join(", ") : [],
                    "description": bookInfos.description || "",
                    "publisher": bookInfos.publisher || "",
                    "publishedDate": bookInfos.publishedDate || "",
                    "link": bookInfos.canonicalVolumeLink || "",
                    "pageCount": bookInfos.pageCount || "",
                    "categories": bookInfos.categories && bookInfos.categories.length ? bookInfos.categories[0] : "",
                    "isbn10": _.get(_.find(industryIdentifiers, {
                        "type": "ISBN_10"
                    }), "identifier") || "",
                    "isbn13": _.get(_.find(industryIdentifiers, {
                        "type": "ISBN_13"
                    }), "identifier") || "",
                    "cover": Boolean(_.keys(bookInfos.imageLinks).length),
                    "preview": _.get(book, "accessInfo.accessViewStatus") !== "NONE",
                    "@": new Date()
                };
            },
            formatAll = function (books) {
                return {
                    "total": Math.min(books.totalItems, maxResult),
                    "books": _.sortBy(_.map(books.items, format), "title")
                };
            },
            refreshCredentials = (token) => new Q.Promise(function (resolve, reject) {
                if (!token) {
                    reject("No oauth connexion.");
                } else {
                    // auth.refreshAccessToken((error, refreshed) => {
                    //     if (error || !refreshed) {
                    //         reject(error || new Error("No refresh token."));
                    //     } else {
                    //         setCredentials(refreshed);
                    //         resolve();
                    //     }
                    // });
                }
            }),
            googleRequest = (fonction, params, token) => new Q.Promise((resolve, reject) => {
                const gFunction = _.get(gBooks, fonction);
                if (_.isUndefined(token)) {
                    // _.assign(params, {
                    //     "key": googleConfig.key
                    // });
                    _.noop();
                } else {
                    _.assign(params, {
                        "auth": {
                            "credentials": token
                        }
                    });
                }
                if (_.isFunction(gFunction)) {
                    gFunction(params, (error, success) => {
                        if (error && error.code !== 401) {
                            reject(error);
                        } else if (error && error.code === 401 && token) {
                            refreshCredentials().then(function () {
                                gFunction(params, (err, result) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve(result);
                                    }
                                });
                            }).catch(reject);
                        } else {
                            resolve(success);
                        }
                    });
                } else {
                    reject("Invalid call.");
                }
            });

        this.associated = (req) => {
            const volumeId = _.get(req, "params[0]");
            if (volumeId) {
                googleRequest("volumes.associated.list", _.merge({
                    volumeId
                }, reqParams.search)).then(formatAll).then(req.response).catch(req.error);
            } else {
                req.error(409);
            }
        };

        this.format = (books) => {
            const ret_books = [];
            for (const book in books) {
                if (_.has(books, book)) {
                    ret_books.push(format(books[book]));
                }
            }
            return ret_books;
        };

        this.add = (params) => googleRequest("mylibrary.bookshelves.addVolume", _.assign(params, {
            "shelf": 7
        }));

        this.all = (params) => googleRequest("mylibrary.bookshelves.volumes.list", _.assign(params, params.search ? reqParams.search : reqParams.import));

        this.search = (req) => {
            if (_.has(req, "query") && _.get(req.query, "search")) {
                const params = {
                        "q": `${req.query.by || ""}${req.query.search}`,
                        "langRestrict": req.query.lang,
                        "startIndex": req.query.index
                    },
                    token = _.get(req.user, "token");
                googleRequest("volumes.list", _.assign(params, reqParams.search), token)
                    .then(formatAll)
                    .then(req.response)
                    .catch(req.error);
            }
        };

        this.detail = (volumeId) => new Q.Promise((resolve, reject) => {
            googleRequest("volumes.get", _.assign({
                volumeId
            }, reqParams.searchOne)).then((response) => {
                resolve(_.assign(format(response), {
                    "isNew": true
                }));
            }).catch(reject);
        });

        this.googleRemove = (params) => googleRequest("mylibrary.bookshelves.removeVolume", _.assign({
            "shelf": 7
        }, params));

        return this;
    };

google.options(gOptions);

exports = module.exports = GoogleAPI();
