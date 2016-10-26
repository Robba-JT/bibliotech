const Q = require("q"),
    console = require("../tools/console"),
    reqOptions = { "gzip": true, "timeout": 5000 },
    request = require("request").defaults(reqOptions),
    googleConfig = require("../google_client_config"),
    //service_account = require("../bibliotech_service_account"),
    _ = require("lodash"),
    google = require("googleapis"),
    gAuth = google.auth.OAuth2,
    gOptions = {
        "gzip": true,
        "headers": {
            "Accept-Encoding": "gzip",
            "Content-Type": "application/json"
        }
    },
    images = require("../tools/images");

google.options(gOptions);

var BooksAPI = exports = module.exports = function (token) {
    "use strict";

    if (!(this instanceof BooksAPI)) { return new BooksAPI(token); }

    var auth = {},
        db = require("../tools/mongo").client,
		gBooks = google.books("v1"),
        db_books = db.collection("books"),
        db_comments = db.collection("comments"),
        db_covers = db.collection("covers"),
        db_alternatives = db.collection("alternatives"),
        db_notifs = db.collection("notifications"),
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
        // anonimiseComments = function (userId) {
        //     return db_comments.update({ "_id.user": userId }, {"$set": { "name": "**********" }}, { "multi": true });
        // },
        // booksEqual = function (a, b) {
        //     var aII = Object.create(a), bII = Object.create(b);
        //     delete aII.cover;
        //     delete bII.cover;
        //     delete aII.date;
        //     delete bII.date;
        //     return _.isEqual(aII, bII);
        // },
        formatOne = function (book) {
            var bookinfos = book.volumeInfo || {};
            return {
                "id": book.id,
                "title": bookinfos.title || "",
                "subtitle": bookinfos.subtitle || "",
                "authors": bookinfos.authors || [],
                "description": bookinfos.description || "",
                "publisher": bookinfos.publisher || "",
                "publishedDate": bookinfos.publishedDate || "",
                "link": bookinfos.canonicalVolumeLink || "",
                "pageCount": bookinfos.pageCount || "",
                "categories": (bookinfos.categories) ? bookinfos.categories[0] : "",
                "isbn10": (bookinfos.industryIdentifiers && !!_.find(bookinfos.industryIdentifiers, { type: "ISBN_10" })) ? _.find(bookinfos.industryIdentifiers, { type: "ISBN_10" }).identifier : "",
                "isbn13": (bookinfos.industryIdentifiers && !!_.find(bookinfos.industryIdentifiers, { type: "ISBN_13" })) ? _.find(bookinfos.industryIdentifiers, { type: "ISBN_13" }).identifier : "",
                "thumbnail": bookinfos.imageLinks && (bookinfos.imageLinks.thumbnail || bookinfos.imageLinks.smallThumbnail) || "",
                "cover": bookinfos.imageLinks && (bookinfos.imageLinks.small || bookinfos.imageLinks.medium || bookinfos.imageLinks.large || bookinfos.imageLinks.extraLarge) || "",
                "access": (book.accessInfo) ? book.accessInfo.accessViewStatus : "NONE",
                "preview": (book.accessInfo) ? book.accessInfo.webReaderLink : "",
                "date": new Date()
            };
        },
        googleRequest = function (fonction, params) {
            return new Q.Promise((resolve, reject) => {
                var gFunction = _.get(gBooks, fonction);
                if (!_.isEmpty(auth.credentials)) { _.assign(params, { "auth": auth }); } else { _.assign(params, { "key": googleConfig.key }); }
                if (typeof gFunction !== "function") {
                    reject("Invalid Call!!!");
                } else {
                    gFunction(params, function (error, success) {
                        if (!!error && error.code !== 401) {
                            reject(error);
                        } else if (!!error && error.code === 401 && !!_.keys(auth).length) {
                            refreshCredentials().then(function () { gFunction(params, (error, result) => {
                                    if (error) {
                                        reject(error);
                                    } else {
                                        resolve(result);
                                    }
                                });
                            }).catch(reject);
                        } else {
                            resolve(success);
                        }
                    });
                }
            });
        },
        refreshCredentials = function () {
            return new Q.Promise(function (resolve, reject) {
                if (_.isEmpty(auth.credentials)) { reject("No oauth connexion!!!"); }
                auth.refreshAccessToken(function (error, token) {
                    if (!!error || !token) { return reject(error || new Error("No refresh token!!!")); }
                    setCredentials(token);
                    resolve();
                });
            });
        },
        setCredentials = function (token) {
			if (!_.keys(auth).length && !!token) {
				auth = new gAuth(googleConfig.web.client_id, googleConfig.web.client_secret, "postmessage");
				_.assign(auth.credentials, token);
			}
        };/*,
        unusedCovers = function () {
            loadCovers({}, function (error, allCovers) {
                if (!!error) { return console.error("Covers removed", error); }
                db.collection("users").find({}, { "db_books.cover": true }).toArray(function (error, userBooks) {
                    if (!!error) { return console.error(error); }
                    var toRemoved = [];
                    userBooks = _.flattenDeep(_.map(userBooks, "books"));
                    allCovers.forEach(function (result) { if (_.findIndex(userBooks, { "cover": result._id }) === -1) { toRemoved.push(result._id); }});
                    if (!!toRemoved.length) { removeCovers({ "_id": {"$in": toRemoved }}); }
                    console.info("Covers removed", toRemoved.length);
                });
            });
        },*/
        /*updateAllBooks = function () {
            var last = (new Date(((new Date()).setDate((new Date()).getDate() - 30))));
            db_books.find({ "date": { "$lte": last }, "id.user": { "$exists": false }}, { "_id": false }).toArray(function (error, result) {
                if (!!error) { console.error("Error Update Books", error); }
                if (!!result) {
                    var updated = 0, removed = 0, requests = [];
                    result.forEach(function (oldOne) {
                        var params = _.merge({ "volumeId": oldOne.id }, reqParams.searchOne);
                        requests.push(new Promise(function () {
                            googleRequest("volumes.get", params, function (error, response) {
                                if (!!error) {
                                    console.error("Error Update One", oldOne.id, error);
                                    if (error.code === 404 && error.message === "The volume ID could not be found.") {
                                        db_books.remove({ "id": oldOne.id });
                                        removed++;
                                    }
                                } else {
                                    var newOne = formatOne(response);
                                    if (!booksEqual(oldOne, newOne)) {
                                        updated++;
                                    }
                                    updateBook(newOne);
                                }
                            });
                        }));
                    });
                    Q.allSettled(requests).then(function () { console.info("Books updated", updated, "removed", removed); });
                }
            });
        };*/

    setCredentials(token);

    this.addCover = (data) => {
        return new Q.Promise((resolve, reject) => {
            this.loadCover({ cover: data.cover }, function (error, result) {
                if (error) {
                    reject(error);
                } else if (result) {
                    resolve(result._id);
                } else {
                    var this_cover = data.cover;
                    images.reduce(this_cover).then((cover) => {
                        console.log("images.reduce", this_cover.length, cover.length);
                        this_cover = cover;
                    }).done(() => {
                        db_covers.insert({ "_id": data._id, "cover": this_cover }).then(() => {
                            resolve(data._id);
                        }).catch(reject);
                    });
                }
            });
        });
    };

    this.associatedBooks = (params) => { return googleRequest("volumes.associated.list", _.merge(params, reqParams.search)); };

    this.formatBooks = (books) => {
        var ret_books = [];
        if (!_.isArray(books)) { return formatOne(books); }
        for (var book in books) { ret_books.push(formatOne(books[book])); }
        return ret_books;
    };

    this.googleAdd = (params) => {
        params.shelf = 7;
        return googleRequest("mylibrary.bookshelves.addVolume", params);
    };

    this.loadAllBooks = (filter, projection) => { return db_books.find(filter, projection).toArray(); };

    this.loadAlt = (filter) => { return db_alternatives.findOne(filter); };

    this.loadAlts = (filter) => { return db_alternatives.find(filter).toArray(); };

    this.loadBase64 = (bookid, url) => {
        return new Q.Promise((resolve, reject) => {
            if (!url) { reject("No url!"); } else {
                var req = request.get({ "url": url, "encoding": "binary" });
                req.on("error", reject);
                req.on("response", (response) => {
                    if (response.statusCode !== 200) {
                        reject("Invalid request");
                    } else {
                        var chunk = [];
                        response.on("data", (data) => { chunk.push(new Buffer(data)); });
                        response.on("end", () => {
                            var content = Buffer.concat(chunk).toString("base64");
                            images.reduce(content).then((cover) => {
                                console.log("images.reduce", content.length, cover.length);
                                content = cover.toString("base64");
                            }).catch((error) => {
                                console.error("images.reduce", error);
                            }).done(() => {
                                resolve({ "id": bookid, "base64": "data:".concat(response.headers["content-type"]).concat(";base64,").concat(content) });
                            });
                        });
                    }
                });
            }
        });
    };

    this.loadBooks = (filter) => { return db_books.find(filter).toArray(); };

    this.loadComments = (filter) => { return db_comments.find(filter).toArray(); };

    this.loadCover = (filter) => { return db_covers.findOne(filter); };

    this.loadCovers = (filter) => { return db_covers.find(filter).toArray(); };

    this.loadNotifs = function (filter) { return db_notifs.find(filter).sort({ "date": 1 }).toArray(); };

    this.loadOne = (filter) => { return db_books.findOne(filter); };

    this.myGoogleBooks = (params) => { return googleRequest("mylibrary.bookshelves.volumes.list", params.search ? _.merge(params, reqParams.search) : _.merge(params, reqParams.import)); };

    this.removeOne = (filter) => { return db_books.remove(filter); };

    this.searchBooks = (params) => { return googleRequest("volumes.list", _.merge(params, reqParams.search)); };

    this.searchOne = (bookid) => {
        return new Q.Promise((resolve, reject) => {
            var params = _.merge({ volumeId: bookid }, reqParams.searchOne);
            googleRequest("volumes.get", params).then((response) => {
                var book = formatOne(response);
                book.isNew = true;
                this.loadBase64(bookid, book.cover).then((response) => {
                    book.base64 = response.base64;
                }).done(() => { resolve(book); });
            }).catch(reject);
        });
    };

    this.googleRemove = (params) => {
        params.shelf = 7;
        return googleRequest("mylibrary.bookshelves.removeVolume", params);
    };

    this.removeComment = (comment) => { return db_comments.remove({ "_id": comment._id }); };

    this.removeAllComments = (userId) => { return db_comments.remove({ "_id.user": userId }); };

    this.removeCovers = (filter) => { return db_covers.remove(filter); };

    this.removeNotifs = (filter) => { return db_notifs.remove(filter); };

    this.removeUserData = (userId) => {
        this.removeNotifs({ "_id.to": userId });
        this.removeAllComments(userId);
    };

    this.updateBook = (book) => {
        var newbook = _.omit(book, ["alt", "base64", "isNew"]);
        return db_books.update({ "id": newbook.id }, { "$set": newbook }, { "upsert": true });
    };

    this.updateComment = (data) => { return db_comments.update({ "_id": data._id }, {"$set": data }, { "upsert": true }); };

    this.updateCover = (data) => { return db_covers.update({ "_id": data._id }, {"$set": data }, { "upsert": true }); };

    this.updateNotif = (data) => { return db_notifs.update({ "_id": data._id }, { "$set": data }, { "upsert": true }); };
};
