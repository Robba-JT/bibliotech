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
                "fields": "id,etag, accessInfo(accessViewStatus),volumeInfo(title, subtitle, authors, publisher, publishedDate, description, industryIdentifiers, pageCount, categories, imageLinks, canonicalVolumeLink)",
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
                "fields": "items(id)",
                "projection": "lite",
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
            loadOne({ id: bookid }, function (error, response) {
                if (!!error || !response) {
                    var params = _.assign({ volumeId: bookid }, Params.searchOne);
                    gBooks.volumes.get(params, function (error, response) {
                        if (!!error || !response) { callback(error || new Error("Bad Single Request!!!")); } else {
                            var book = formatOne(response);
                            book.isNew = true;
                            callback(null, book);
                        }
                    });
                } else {
                    return callback(null, response);
                }
            });
        },
        updateBook = function (newbook, callback) {
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
    this.loadBase64 = function (book, index) {
        var defColor = Q.defer(), params = reqOption, retbook = { _id: book._id, cover: book.cover };
        if (!!index) { retbook.index = index; }
        if (!book.cover) { defColor.resolve(book); }
        params.url = book.cover;
        params.encoding = "binary";
        request.get(params, function (error, response, body) {
            if (!!error || response.statusCode !== 200) {
                defColor.reject(retbook);
            } else {
                retbook.cover = "data:" + response.headers["content-type"] + ";base64," + new Buffer(body, "binary").toString("base64");
                defColor.resolve(retbook);
            }
        });
        return defColor.promise;
    };
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

/*    books.find({}).toArray(function (err, response) {
        if (!!err) { console.error(err); }
        for (var jta in response) {
            var params = _.assign({ volumeId: response[jta].id }, Params.searchOne);
            gBooks.volumes.get(params, function (error, response) {
                if (!!response) { updateBook(formatOne(response)); }
            });
        }
    });*/

/*    loadBooks({}, function (err, response) {
        if (!!err) { console.error(err); }
        var books = [];
        for (var jta in response) {
            var book = response[jta];
            if (book._id) {
                books.push({ book: book.id });
            }
        }
        console.log(books);
        db.collection("users").update({ _id: "robba.jt@gmail.com" }, {$set: { userbooks: books }}, function (err, success) {
            console.error(err);
            console.log(success);
        });
    });*/

/*    books.find({}).toArray(function (error, colbook) {
        if (!!error) { return console.error("find", error); }
        books.remove({}, function (err, success) {
            if (!!err) { return console.error("remove", err); }
            var params = Params.searchOne;
            for (var jta=0, lgBooks = colbook.length; jta < lgBooks; jta++) {
                var book = colbook[jta];
                params.volumeId = book.id;
                gBooks.volumes.get(params, function (error, response) {
                    if (!!error) { return console.error(book.title, error); }
                    var newbook = formatOne(response);
                    books.update({ id: newbook.id }, newbook, { upsert: true },function (err, result) {
                        if (!!err) { return console.error("insert", newbook.title, err); }
                        console.log("Inserted new book: " + newbook.title);
                    });
                });
            }
        });
    });*/
};
