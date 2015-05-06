var Q = require("q"),
    request = require("request"),
    google = require("googleapis"),
    gBooks = google.books({ version: "v1" }),
    _ = require("lodash"),
    gOptions = {
        "gzip": true,
        "headers": {
            "Accept-Encoding": "gzip"
        },
        "timeout": 5000
    },
    reqOption = { "gzip": true };

google.options(gOptions);

module.exports.BooksAPI = BooksAPI = function (db) {
    "use strict";

    if (!(this instanceof BooksAPI)) { return new BooksAPI(db); }

    var books = db.collection("books"),
        comments = db.collection("comments"),
        notifs = db.collection("notifications"),
        covers = db.collection("covers"),
        Params = {
            "searchOne": {
                "fields": "id, etag, accessInfo(accessViewStatus), volumeInfo(title, subtitle, authors, publisher, publishedDate, description, industryIdentifiers, pageCount, categories, imageLinks, canonicalVolumeLink)",
                "projection": "full",
                "key": "AIzaSyA0t8hJ9KrKfTBKVBBZq5gXIbg7vuh5yHk"
            },
            "search": {
                "maxResults": 40,
                "fields": "items(id, etag, accessInfo(accessViewStatus), volumeInfo(title, authors, description, imageLinks))",
                "projection": "lite",
                "order": "relevance",
                "printType": "books",
                "key": "AIzaSyA0t8hJ9KrKfTBKVBBZq5gXIbg7vuh5yHk"
            },
            "import": {
                "maxResults": 40,
                "shelf": 7,
                "fields": "items(id, etag, accessInfo(accessViewStatus), volumeInfo(title, subtitle, authors, publisher, publishedDate, description, industryIdentifiers, pageCount, categories, imageLinks, canonicalVolumeLink))",
                "projection": "full",
                "printType": "books",
                "key": "AIzaSyA0t8hJ9KrKfTBKVBBZq5gXIbg7vuh5yHk"
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
                "access": (!!book.accessInfo) ? book.accessInfo.accessViewStatus : "NONE"
            };
        },
        loadOne = function (filter, callback) {
            books.findOne(filter, callback);
        },
        removeNotifs = function (filter, callback) {
            notifs.remove(filter, callback);
        },
        removeCovers = function (filter, callback) {
            covers.remove(filter, callback);
        },
        searchOne = function (bookid, callback) {
            var params = _.assign({ volumeId: bookid }, Params.searchOne);
            gBooks.volumes.get(params, function (error, response) {
                if (!!error || !response) { callback(error || new Error("Bad Single Request!!!")); } else {
                    var book = formatOne(response);
                    book.isNew = true;
                    if (!!book.cover) {
                        loadBase64(book.cover).done(function (response) {
                            if (!!response && !!response.cover) { book.cover = response.cover; }
                            callback(null, book);
                        });
                    } else {
                        callback(null, book);
                    }
                }
            });
        },
        loadBase64 = function (url, index) {
            var defColor = Q.defer(), params = reqOption;
            if (!url) { defColor.reject(); }
            params.url = url;
            params.encoding = "binary";
            request.get(params, function (error, response, body) {
                if (!!error || response.statusCode !== 200) {
                    defColor.reject();
                } else {
                    defColor.resolve({ cover: "data:" + response.headers["content-type"] + ";base64," + new Buffer(body, "binary").toString("base64"), index: index });
                }
            });
            return defColor.promise;
        };

    this.updateBook = function (newbook, callback) {
        delete newbook.isNew;
        books.update({ id: newbook.id }, newbook, { upsert: true }, callback);
    };
    this.formatBooks = function (books) {
        var retbooks = [];
        if (!_.isArray(books)) { return formatOne(books); }
        for (var book in books) {
            retbooks.push(formatOne(books[book]));
        }
        return retbooks;
    };
    this.loadCovers = function (filter, callback) {
        covers.find(filter).toArray(callback);
    };
    this.loadBooks = function (filter, callback) {
        books.find(filter).sort({ title : 1 }).toArray(callback);
    };
    this.loadNotifs = function (filter, callback) {
        notifs.find(filter).sort({ date: 1 }).toArray(callback);
    };
    this.loadBase64 = loadBase64;
    this.loadOne = loadOne;
    this.searchOne = searchOne;
    this.searchBooks = function (params, callback) {
        gBooks.volumes.list(_.assign(params, Params.search), callback);
    };
    this.associatedBooks = function (params, callback) {
        gBooks.volumes.associated.list(_.assign(params, Params.search), callback);
    };
    this.myGoogleBooks = function (params, callback) {
        params.langRestrict = "fr";
        gBooks.mylibrary.bookshelves.list(params, callback);
    };
    this.myGoogleVolumes = function (params, callback) {
        gBooks.mylibrary.bookshelves.volumes.list((!!params.import) ? _.assign(params, Params.import) : _.assign(params, Params.search), callback);
    };
    this.googleAdd = function (params, callback) {
        params.shelf = 7;
        gBooks.mylibrary.bookshelves.addVolume(params, callback);
    };
    this.googleRemove = function (params, callback) {
        params.shelf = 7;
        gBooks.mylibrary.bookshelves.removeVolume(params, callback);
    };
    this.updateNotif = function (data, callback) {
        notifs.update({ _id: data._id }, { $set: data }, { upsert: true }, callback);
    };
    this.removeCovers = removeCovers;
    this.removeUserData = function (userId) { removeCovers({ "_id.user": userId }); removeNotifs({ "_id.to": userId }); };
    this.updateCover = function (data, callback) {
        covers.update({ _id: data._id }, {$set: data }, { upsert: true }, callback);
    };
    this.loadComments = function (filter, callback) {
        comments.find(filter).toArray(callback);
    };
    this.updateComment = function (data, callback) {
        comments.update({ _id: data._id }, {$set: data }, { upsert: true }, callback);
    };
};
