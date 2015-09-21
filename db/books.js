var Q = require("q"),
    request = require("request"),
    reqOptions = { "gzip": true },
    fs = require("fs"),
    googleKey = JSON.parse(fs.readFileSync("google_client_config.json")).key,
    _ = require("lodash"),
    gBooks = require("googleapis").books("v1");

module.exports.BooksAPI = BooksAPI = function (db, authClient) {
    "use strict";

    if (!(this instanceof BooksAPI)) { return new BooksAPI(db, authClient); }

    var books = db.collection("books"),
        comments = db.collection("comments"),
        notifs = db.collection("notifications"),
        covers = db.collection("covers"),
        addParam = _.isEmpty(authClient.credentials) ? { "key": googleKey } : { "auth": authClient },
        reqParams = {
            "searchOne": {
                "fields": "id, etag, accessInfo(accessViewStatus), volumeInfo(title, subtitle, authors, publisher, publishedDate, description, industryIdentifiers, pageCount, categories, imageLinks, canonicalVolumeLink)",
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
                "cover": (!!bookinfos.imageLinks) ? bookinfos.imageLinks.small || bookinfos.imageLinks.medium || bookinfos.imageLinks.large || bookinfos.imageLinks.extraLarge || bookinfos.imageLinks.thumbnail || bookinfos.imageLinks.smallThumbnail : "",
                "access": (!!book.accessInfo) ? book.accessInfo.accessViewStatus : "NONE",
                "date": new Date()
            };
        },
        loadOne = function (filter, callback) {
            books.findOne(filter, function (error, book) {
                if (!!error || !book) { callback(error || new Error("No book")); } else {
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
            gBooks.volumes.get(params, function (error, response) {
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
        loadCover = function (filter, callback) {
            covers.findOne(filter, callback);
        },
        loadCovers = function (filter, callback) {
            covers.find(filter).toArray(callback);
        },
        loadBase64 = function (url, bookid) {
            var defColor = Q.defer(), params = reqOptions;
            if (!url) { defColor.reject(); }
            params.url = url;
            params.encoding = "binary";
            request.get(params, function (error, response, body) {
                if (!!error || response.statusCode !== 200) {
                    defColor.reject(error || new Error("status: " + response.statusCode));
                } else {
                    defColor.resolve({ "base64": "data:" + response.headers["content-type"] + ";base64," + new Buffer(body, "binary").toString("base64"), "id": bookid });
                }
            });
            return defColor.promise;
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
                            gBooks.volumes.get(params, function (error, response) {
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
        },
        booksEqual = function (a, b) {
            var aII = Object.create(a), bII = Object.create(b);
            delete aII.cover;
            delete bII.cover;
            delete aII.date;
            delete bII.date;
            return _.isEqual(aII, bII);
        },
        anonimiseComments = function (userId, callback) {
            comments.update({ "_id.user": userId }, {"$set": { "name": "**********" }}, { "multi": true }, callback);
        };

    for (var param in reqParams) { _.assign(reqParams[param], addParam); }

    this.updateBook = updateBook;
    this.formatBooks = function (books) {
        var retbooks = [];
        if (!_.isArray(books)) { return formatOne(books); }
        for (var book in books) {
            retbooks.push(formatOne(books[book]));
        }
        return retbooks;
    };
    this.loadCover = loadCover;
    this.loadCovers = loadCovers;
    this.loadBooks = function (filter, callback) {
        books.find(filter).sort({ "title" : 1 }).toArray(callback);
    };
    this.loadAllBooks = function (filter, projection, callback) {
        books.find(filter, projection).toArray(callback);
    };
    this.loadNotifs = function (filter, callback) {
        notifs.find(filter).sort({ "date": 1 }).toArray(callback);
    };
    this.loadBase64 = loadBase64;
    this.loadOne = loadOne;
    this.removeOne = removeOne;
    this.searchOne = searchOne;
    this.searchBooks = function (params, callback) {
        params = _.merge(params, reqOptions);
        gBooks.volumes.list(_.merge(params, reqParams.search), callback);
    };
    this.associatedBooks = function (params, callback) {
        gBooks.volumes.associated.list(_.merge(params, reqParams.search), callback);
    };
    this.myGoogleBooks = function (params, callback) {
        gBooks.mylibrary.bookshelves.volumes.list((!!params.search) ? _.merge(params, reqParams.search) : _.merge(params, reqParams.import), callback);
    };
    this.googleAdd = function (params, callback) {
        params.shelf = 7;
        _.assign(params, addParam);
        gBooks.mylibrary.bookshelves.addVolume(params, callback);
    };
    this.googleRemove = function (params, callback) {
        params.shelf = 7;
        _.assign(params, addParam);
        gBooks.mylibrary.bookshelves.removeVolume(params, callback);
    };
    this.updateNotif = function (data, callback) {
        notifs.update({ "_id": data._id }, { "$set": data }, { "upsert": true }, callback);
    };
    this.removeCovers = removeCovers;
    this.removeNotifs = removeNotifs;
    this.removeUserData = function (userId) {
        removeNotifs({ "_id.to": userId });
        anonimiseComments(userId);
    };
    this.updateCover = function (data, callback) {
        covers.update({ "_id": data._id }, {"$set": data }, { "upsert": true }, callback);
    };
    this.loadComments = function (filter, callback) {
        comments.find(filter).toArray(callback);
    };
    this.updateComment = function (data, callback) {
        comments.update({ "_id": data._id }, {"$set": data }, { "upsert": true }, callback);
    };
    this.removeComment = function (comment, callback) {
        comments.remove({ "_id": comment._id }, callback);
    };
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
};
