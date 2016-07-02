var Q = require("q"),
    request,
    reqOptions = { "gzip": true, "timeout": 5000 },
    fs = require("fs"),
    googleConfig = JSON.parse(fs.readFileSync("google_client_config.json")),
    _ = require("lodash"),
    google = require("googleapis"),
    gAuth = google.auth.OAuth2,
    gOptions = {
        "gzip": true,
        "headers": {
            "Accept-Encoding": "gzip",
            "Content-Type": "application/json"
        }
    };

request = require("request").defaults(reqOptions);
google.options(gOptions);

module.exports.BooksAPI = BooksAPI = function (db, token) {
    "use strict";

    if (!(this instanceof BooksAPI)) { return new BooksAPI(db); }

    var auth = {},
		gBooks = google.books("v1"),
        books = db.collection("books"),
        comments = db.collection("comments"),
        covers = db.collection("covers"),
        notifs = db.collection("notifications"),
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
        anonimiseComments = function (userId, callback) {
            comments.update({ "_id.user": userId }, {"$set": { "name": "**********" }}, { "multi": true }, callback);
        },
        booksEqual = function (a, b) {
            var aII = Object.create(a), bII = Object.create(b);
            delete aII.cover;
            delete bII.cover;
            delete aII.date;
            delete bII.date;
            return _.isEqual(aII, bII);
        },
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
                "categories": (!!bookinfos.categories) ? bookinfos.categories[0] : "",
                "isbn10": (!!bookinfos.industryIdentifiers && !!_.find(bookinfos.industryIdentifiers, { type: "ISBN_10" })) ? _.find(bookinfos.industryIdentifiers, { type: "ISBN_10" }).identifier : "",
                "isbn13": (!!bookinfos.industryIdentifiers && !!_.find(bookinfos.industryIdentifiers, { type: "ISBN_13" })) ? _.find(bookinfos.industryIdentifiers, { type: "ISBN_13" }).identifier : "",
                "cover": (!!bookinfos.imageLinks) ? /*bookinfos.imageLinks.small || bookinfos.imageLinks.medium || bookinfos.imageLinks.large ||*/ bookinfos.imageLinks.extraLarge || bookinfos.imageLinks.thumbnail || bookinfos.imageLinks.smallThumbnail : "",
                "access": (!!book.accessInfo) ? book.accessInfo.accessViewStatus : "NONE",
                "preview": (!!book.accessInfo) ? book.accessInfo.webReaderLink : "",
                "date": new Date()
            };
        },
        googleRequest = function (fonction, params, callback) {
            var gFunction = _.get(gBooks, fonction);
            if (typeof params === "function") { callback = params; params = {}; }
            if (!_.isEmpty(auth.credentials)) { _.assign(params, { "auth": auth }); } /*else { _.assign(params, { "key": googleConfig.key }); }*/
            if (typeof gFunction !== "function") { return callback ? callback(new Error("Invalid Call!!!")) : new Error("Invalid Call!!!"); }
            gFunction(params, function (error, success) {
                if (!!error && error.code !== 401) { return callback ? callback(error) : error; }
                if (!!error && error.code === 401 && !!_.keys(auth).length) {
                    refreshCredentials()
                        .then(function () { gFunction(params, callback); })
                        .catch(callback);
                } else {
                    return callback ? callback(null, success) : success;
                }
            });
        },
        loadBase64 = function (url, bookid) {
			return new Q.Promise(function (resolve, reject) {
				if (!url) { return reject(); }
				request.get({ "url": url, "encoding": "binary" }, function (error, response, body) {
					if (!!error || response.statusCode !== 200) {
                    reject(error || new Error("status: " + response.statusCode));
                } else {
                    resolve({
						"id": bookid,
						"base64": "data:" + response.headers["content-type"] + ";base64," + new Buffer(body, "binary").toString("base64")
					});
                }
				});
			});
        },
        loadComments = function (filter, callback) {
            comments.find(filter).toArray(callback);
        },
        loadCover = function (filter, callback) {
            covers.findOne(filter, callback);
        },
        loadCovers = function (filter, callback) {
            covers.find(filter).toArray(callback);
        },
        loadOne = function (filter, callback) {
            books.findOne(filter, function (error, book) {
                if (!!error || !book) { callback(error || new Error("No book")); } else { callback(null, book); }
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
        removeOne = function (filter, callback) {
            books.remove(filter, callback);
        },
        removeNotifs = function (filter, callback) {
            notifs.remove(filter, callback);
        },
        removeCovers = function (filter, callback) {
            covers.remove(filter, callback);
        },
        searchOne = function (bookid, callback) {
            var params = _.merge({ volumeId: bookid }, reqParams.searchOne);
            googleRequest("volumes.get", params, function (error, response) {
                if (!!error || !response) { callback(error || new Error("Bad Single Request!!!")); } else {
                    var book = formatOne(response);
                    book.isNew = true;
                    if (!!book.cover) {
                        loadBase64(book.cover).done(function (response) {
                            if (!!response && !!response.base64) { book.base64 = response.base64; }
                            callback(null, book);
                        });
                    } else {
                        callback(null, book);
                    }
                }
            });
        },
        setCredentials = function (token) {
			if (!_.keys(auth).length && !!token) {
				auth = new gAuth(googleConfig.web.client_id, googleConfig.web.client_secret, "postmessage");
				_.assign(auth.credentials, token);
			}
        },
        unusedCovers = function () {
            loadCovers({}, function (error, allCovers) {
                if (!!error) { return console.error("Covers removed", error); }
                db.collection("users").find({}, { "books.cover": true }).toArray(function (error, userBooks) {
                    if (!!error) { return console.error(error); }
                    var toRemoved = [];
                    userBooks = _.flattenDeep(_.pluck(userBooks, "books"));
                    allCovers.forEach(function (result) { if (_.findIndex(userBooks, { "cover": result._id }) === -1) { toRemoved.push(result._id); }});
                    if (!!toRemoved.length) { removeCovers({ "_id": {"$in": toRemoved }}); }
                    console.info("Covers removed", toRemoved.length);
                });
            });
        },
        updateAllBooks = function () {
            var last = (new Date(((new Date()).setDate((new Date()).getDate() - 30))));
            books.find({ "date": { "$lte": last }, "id.user": { "$exists": false }}, { "_id": false }).toArray(function (error, result) {
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
                                        books.remove({ "id": oldOne.id });
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
        },
        updateBook = function (book, callback) {
            var newbook = _.omit(book, "base64");
            books.update({ "id": newbook.id }, { "$set": newbook }, { "upsert": true }, callback);
        };

    setCredentials(token);

    this.addCover = function (data, callback) {
        loadCover({ cover: data.cover }, function (error, result) {
            if (!!error) { return callback(error); }
            if (!!result) { return callback(null, result._id); }
            covers.insert(data, function (error, result) {
                if (!!error) { return callback(error); }
                return callback(null, data._id);
            });
        });
    };
    this.associatedBooks = function (params, callback) {
        googleRequest("volumes.associated.list", _.merge(params, reqParams.search), callback);
    };
    this.formatBooks = function (books) {
        var retbooks = [];
        if (!_.isArray(books)) { return formatOne(books); }
        for (var book in books) {
            retbooks.push(formatOne(books[book]));
        }
        return retbooks;
    };
    this.googleAdd = function (params, callback) {
        params.shelf = 7;
        googleRequest("mylibrary.bookshelves.addVolume", params, callback);
    };
    this.loadAllBooks = function (filter, projection, callback) {
        books.find(filter, projection).toArray(callback);
    };
    this.loadBase64 = loadBase64;
    this.loadBooks = function (filter, callback) {
        books.find(filter).toArray(callback);
    };
    this.loadComments = loadComments;
    this.loadCover = loadCover;
    this.loadCovers = loadCovers;
    this.loadNotifs = function (filter, callback) {
        notifs.find(filter).sort({ "date": 1 }).toArray(callback);
    };
    this.loadOne = loadOne;
    this.myGoogleBooks = function (params, callback) {
        googleRequest("mylibrary.bookshelves.volumes.list", !!params.search ? _.merge(params, reqParams.search) : _.merge(params, reqParams.import), callback);
    };
    this.removeOne = removeOne;
    this.searchBooks = function (params, callback) {
        //params = _.merge(params, reqOptions);
        googleRequest("volumes.list", _.merge(params, reqParams.search), callback);
    };
    this.searchOne = searchOne;
    this.googleRemove = function (params, callback) {
        params.shelf = 7;
        googleRequest("mylibrary.bookshelves.removeVolume", params, callback);
    };
    this.removeComment = function (comment, callback) {
        comments.remove({ "_id": comment._id }, callback);
    };
    this.removeAllComments = function (userId, callback) {
        comments.remove({ "_id.user": userId }, callback);
    };
    this.removeCovers = removeCovers;
    this.removeNotifs = removeNotifs;
    this.removeUserData = function (userId) {
        removeNotifs({ "_id.to": userId });
        //anonimiseComments(userId);
        removeAllComments(userId);
    };
    this.updateBook = updateBook;
    this.updateComment = function (data, callback) {
        comments.update({ "_id": data._id }, {"$set": data }, { "upsert": true }, callback);
    };
    this.updateCover = function (data, callback) {
        covers.update({ "_id": data._id }, {"$set": data }, { "upsert": true }, callback);
    };
    this.updateNotif = function (data, callback) {
        notifs.update({ "_id": data._id }, { "$set": data }, { "upsert": true }, callback);
    };
};
