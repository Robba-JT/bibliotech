const console = require("../tools/console"),
    Q = require("q"),
    _ = require("lodash"),
    googleConfig = require("../google_client_config"),
    google = require("googleapis"),
    gAuth = google.auth.OAuth2,
    gBooks = google.books("v1"),
    RequestsAPI = require("./requests"),
    gOptions = {
        "gzip": true,
        //"proxy": "http://CGDM-EMEA%5Cjtassin:password_20@isp-ceg.emea.cegedim.grp:3128/",
        "headers": {
            "Accept-Encoding": "gzip",
            "Content-Type": "application/json"
        }
    },
    GoogleAPI = function (token) {
        if (!(this instanceof GoogleAPI)) {
            return new GoogleAPI(token);
        }

        const auth = {},
            reqParams = {
                "searchOne": {
                    "fields": "id, etag, accessInfo(accessViewStatus, webReaderLink), volumeInfo(title, subtitle, authors, publisher, publishedDate, description, industryIdentifiers, pageCount, categories, imageLinks, canonicalVolumeLink)",
                    "projection": "full"
                },
                "search": {
                    "maxResults": 40,
                    "fields": "items(id, etag, accessInfo(accessViewStatus), volumeInfo(title, authors, description, imageLinks))",
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
                const bookinfos = book.volumeInfo || {},
                    industryIdentifiers = _.get(bookinfos, "industryIdentifiers") || {};

                return {
                    "id": book.id,
                    "title": bookinfos.title || "",
                    "subtitle": bookinfos.subtitle || "",
                    "authors": bookinfos.authors.sort().join(", ") || [],
                    "description": bookinfos.description || "",
                    "publisher": bookinfos.publisher || "",
                    "publishedDate": bookinfos.publishedDate || "",
                    "link": bookinfos.canonicalVolumeLink || "",
                    "pageCount": bookinfos.pageCount || "",
                    "categories": bookinfos.categories ? bookinfos.categories[0] : "",
                    "isbn10": _.get(_.find(industryIdentifiers, {
                        "type": "ISBN_10"
                    }), "identifier") || "",
                    "isbn13": _.get(_.find(industryIdentifiers, {
                        "type": "ISBN_13"
                    }), "identifier") || "",
                    "cover": bookinfos.imageLinks ? bookinfos.imageLinks.small || bookinfos.imageLinks.medium || bookinfos.imageLinks.large || bookinfos.imageLinks.extraLarge || bookinfos.imageLinks.thumbnail || bookinfos.imageLinks.smallThumbnail : false,
                    "access": _.get(book, "accessInfo.accessViewStatus") || "NONE",
                    "preview": _.get(book, "accessInfo.webReaderLink") || "",
                    "date": new Date()
                };
            },
            formatAll = function (books) {
                return _.sortBy(_.map(books.items || books, format), "title");
            },
            setCredentials = function (to_set) {
                if (!_.keys(auth).length && to_set) {
                    _.assign(auth, new gAuth(googleConfig.web.client_id, googleConfig.web.client_secret, "postmessage"));
                    _.assign(auth.credentials, to_set);
                }
            },
            refreshCredentials = () => new Q.Promise(function (resolve, reject) {
                if (_.isEmpty(auth.credentials)) {
                    reject("No oauth connexion.");
                } else {
                    auth.refreshAccessToken((error, refreshed) => {
                        if (error || !refreshed) {
                            reject(error || new Error("No refresh token."));
                        } else {
                            setCredentials(refreshed);
                            resolve();
                        }
                    });
                }
            }),
            googleRequest = (fonction, params) => new Q.Promise((resolve, reject) => {
                const gFunction = _.get(gBooks, fonction);
                if (_.isEmpty(auth.credentials)) {
                    _.assign(params, {
                        "key": googleConfig.key
                    });
                } else {
                    _.assign(params, {
                        auth
                    });
                }
                if (_.isFunction(gFunction)) {
                    gFunction(params, (error, success) => {
                        if (error && error.code !== 401) {
                            reject(error);
                        } else if (error && error.code === 401 && _.keys(auth).length) {
                            refreshCredentials().then(function () {
                                gFunction(params, (err, result) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve(formatAll(result));
                                    }
                                });
                            }).catch(reject);
                        } else {
                            resolve(formatAll(success));
                        }
                    });
                } else {
                    reject("Invalid call.");
                }
            });

        setCredentials(token);

        this.associated = (params) => googleRequest("volumes.associated.list", _.merge(params, reqParams.search));

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

        this.search = (params) => googleRequest("volumes.list", _.assign(params, reqParams.search));

        this.detail = (bookid) => new Q.Promise((resolve, reject) => {
            googleRequest("volumes.get", _.assign({
                "volumeId": bookid
            }, reqParams.searchOne)).then((response) => {
                const book = format(response);
                book.isNew = true;
                RequestsAPI.loadBase64(bookid, book.cover || book.thumbnail).then((res) => {
                    book.base64 = res.base64;
                }).catch((error) => {
                    console.error("serachOne loadBase64", book.id, book.title, book.cover, book.thumbnail, error);
                }).done(() => {
                    resolve(book);
                });
            }).catch(reject);
        });

        this.googleRemove = (params) => googleRequest("mylibrary.bookshelves.removeVolume", _.assign({
            "shelf": 7
        }, params));

        return this;
    };

google.options(gOptions);

exports = module.exports = GoogleAPI;
