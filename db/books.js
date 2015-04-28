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

if (require("ip").address() === "128.1.236.11") {
    gOptions.proxy = "http://CGDM-EMEA\jtassin:password_4@isp-ceg.emea.cegedim.grp:3128/";
    reqOption.proxy = "http://CGDM-EMEA\jtassin:password_4@isp-ceg.emea.cegedim.grp:3128/";
}
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
                "authors": bookinfos.authors || "",
                "description": bookinfos.description || "",
                "publisher": bookinfos.publisher || "",
                "publishedDate": bookinfos.publishedDate || "",
                "link": bookinfos.canonicalVolumeLink || "",
                "pageCount": bookinfos.pageCount || "",
                "categories": bookinfos.categories || "",
                "isbn10": (!!bookinfos.industryIdentifiers && !!_.find(bookinfos.industryIdentifiers, { type: "ISBN_10" })) ? _.find(bookinfos.industryIdentifiers, { type: "ISBN_10" }).identifier : "",
                "isbn13": (!!bookinfos.industryIdentifiers && !!_.find(bookinfos.industryIdentifiers, { type: "ISBN_13" })) ? _.find(bookinfos.industryIdentifiers, { type: "ISBN_13" }).identifier : "",
                "cover": (!!bookinfos.imageLinks) ? bookinfos.imageLinks.small || bookinfos.imageLinks.medium || bookinfos.imageLinks.large || bookinfos.imageLinks.extraLarge || bookinfos.imageLinks.thumbnail || bookinfos.imageLinks.smallThumbnail : "",
                "access": (!!book.accessInfo) ? book.accessInfo.accessViewStatus : "NONE"
            };
        },
        formatBooks = function (books) {
            var retbooks = [];
            if (!_.isArray(books)) { return formatOne(books); }
            for (var book in books) {
                retbooks.push(formatOne(books[book]));
            }
            return retbooks;
        },
        coversQuery = function (query) {
            var defCover = Q.defer();
            covers.find(query).toArray(function (err, cover) {
                if (!!err) { defCover.reject(err); } else { defCover.resolve(cover); }
            });
            return defCover.promise;
        },
        loadBooks = function (filter, callback) {
            books.find(filter).sort({ title : 1 }).toArray(callback);
        },
        loadOne = function (filter, callback) {
            books.findOne(filter, callback);
        },
        loadNotifs = function (filter, callback) {
            notifs.find(filter).sort({ date: 1 }).toArray(callback);
        },
        removeNotifs = function (filter, callback) {
            notifs.remove(filter, callback);
        },
        loadCovers = function (filter, callback) {
            covers.find(filter).toArray(callback);
        },
        removeCovers = function (filter, callback) {
            covers.remove(filter, callback);
        },
        loadBase64 = function (book, index) {
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
        },
        searchBooks = function (params, callback) {
            params = _.assign(params, Params.search);
            gBooks.volumes.list(params, callback);
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
        },
        loadComments = function (filter, callback) {
            comments.find(filter).toArray(callback);
        },
        updateComment = function (data, callback) {
            comments.update({ _id: data._id }, {$set: data }, { upsert: true}, callback);
        },
        addBook = function (bookid, callback) {
            searchOne(bookid, function (error, response) {
                if (error) { return callback(error); }
                if (!!response.isNew) {
                    delete response.isNew;
                    updateBook(response, function (error, success) {
                        if (error) { return callback(error); }
                        return callback(null, response);
                    });
                } else {
                    return callback(null, response);
                }
            });
        },
        updateCover = function (data, callback) {
            covers.update({ _id: data._id }, {$set: data }, { upsert: true }, callback);
        };

    this.formatBooks = formatBooks;
    this.loadCovers = loadCovers;
    this.loadOne = loadOne;
    this.loadBooks = loadBooks;
    this.loadNotifs = loadNotifs;
    this.loadBase64 = loadBase64;
    this.searchOne = searchOne;
    this.searchBooks = searchBooks;
    this.addBook = addBook;
    this.removeCovers = removeCovers;
    this.removeUserData = function (userId) { removeCovers({ "_id.user": userId }); removeNotifs({ "_id.to": userId }); };
    this.updateCover = updateCover;
    this.loadComments = loadComments;
    this.updateComment = updateComment;

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

/** Gestion des livres  **/
/**
    this.loadBooks = function (user, filter, callback) {
        books.find(filter).sort({ title : 1 }).toArray(function (err, result) {
            if (!!err) { return callback(err, null); }
            for (var jta = 0, lgResult = result.length; jta < lgResult; jta++) {
                var index = _.findIndex(result[jta].comments, { authorId : user });
                if (index !== -1) {
                    result[jta].userComment = result[jta].comments[index].comment || "";
                    result[jta].userNote = result[jta].comments[index].note || null;
                    result[jta].userDate = result[jta].comments[index].date || "";
                    result[jta].comments.splice(index, 1);
                }
            }
            return callback(null, result);
        });
    };

    this.updateBook = function (newbook, callback) {
        books.update({ id: newbook.id }, newbook, { upsert: true },function (err, result) {
            if (!!err) { return callback(err, null); }
            return callback(err, newbook.id);
        });
    };

    this.addComment = function (book, user, name, body, value, callback) {
        var comment = {
            authorId : user,
            authorName : name,
            comment : body,
            note : value,
            date : new Date()
        };
        books.update({ id : book }, { $pull: { comments: { authorId : user }}}, function (err, numModified) {
            if (!!err) { return callback(err, null); }
            books.update({ id : book }, { $addToSet : { comments : comment } }, function (err, numModified) {
                if (!!err) { return callback(err, null); }
                return callback(err, numModified);
            });
        });
    };
/** Fin Gestion des livres  **/

/** Gestion Google API  **/
/**
    this.searchBook = function (params) {
        var defReq = Q.defer();
        params = _.assign(params, Params.searchOne);
        gBooks.volumes.get(params, function (error, response) {
            if (!!error) {
                defReq.reject(error);
            } else {
                defReq.resolve(formatBookData(response)[0]);
            }
        });
        return defReq.promise;
    };

    this.searchBooks = function (params) {
        var defReq = Q.defer();
        params = _.assign(params, Params.search);
        gBooks.volumes.list(params, function (error, response) {
            if (!!error) {
                defReq.reject(error);
            } else {
                var retSearch = [];
                if (!!response && !!response.items) {
                    retSearch = formatBookData(response.items);
                }
                defReq.resolve(retSearch);
            }
        });
        return defReq.promise;
    };

    this.searchAssociatedBooks = function (params) {
        var defReq = Q.defer();
        params = _.assign(params, Params.search);
        gBooks.volumes.associated.list(params, function (error, response) {
            if (!!error) {
                defReq.reject(error);
            } else {
                var retSearch = [];
                if (!!response && !!response.items) {
                    retSearch = formatBookData(response.items);
                }
                defReq.resolve(retSearch);
            }
        });
        return defReq.promise;
    };

    this.myGoogleBookshelves = function (token) {
        var defShelves = Q.defer();
        var params = token;
        params.langRestrict = "fr";
        gBooks.mylibrary.bookshelves.list(params, function (err, response) {
            if (!!err) {
                defShelves.reject(err);
            } else {
                var retSearch = [];
                if (!!response && !!response.items) {
                    retSearch = formatBookData(response.items);
                }
                defShelves.resolve(retSearch);
            }
        });
        return defShelves.promise;
    };

    this.myGoogleBookshelvesVolumes = function (params) {
        var defBooks = Q.defer();
        params = (!!params.import) ? _.assign(params, Params.import) : _.assign(params, Params.search);
        gBooks.mylibrary.bookshelves.volumes.list(params, function (err, response) {
            if (!!err) {
                defBooks.reject(err);
            } else {
                var retSearch = [];
                if (!!response && !!response.items) {
                    retSearch = formatBookData(response.items);
                }
                defBooks.resolve(retSearch);
            }
        });
        return defBooks.promise;
    };

    this.googleAdd = function (params) {
        var defAdd = Q.defer();
        params.shelf = 7;
        gBooks.mylibrary.bookshelves.addVolume(params, function (err, success) {
            if (!!err) {
                defAdd.reject(err);
            } else {
                defAdd.resolve(success);
            }
        });
        return defAdd.promise;
    };

    this.googleRemove = function (params) {
        var defRemove = Q.defer();
        params.shelf = 7;
        gBooks.mylibrary.bookshelves.removeVolume(params, function (err, success) {
            if (!!err) {
                defRemove.reject(err);
            } else {
                defRemove.resolve(success);
            }
        });
        return defRemove.promise;
    };
/** Fin Gestion Google API  **/

/** Gestion des Images  **/
/**
    this.addCover = function (user, book, cover, altcolor, callback) {
        covers.update({ _id : { user : user, book : book }}, { $set : { cover : cover, altcolor: altcolor }}, { upsert : true }, function (err, success) {
            if (!!err) { return callback(err, null); }
            return callback(null, success);
        });
    };

    this.removeCovers = function (query, callback) {
        covers.remove(query, function (err, success) {
            if (!!err) { return callback(err, null); }
            return callback(null, success);
        });
    };

    this.loadBase64 = function (book) {
        var defColor = Q.defer();
        var params = reqOption;
        if (!book || !book.cover) { defColor.reject({ error: "no book cover!!!", book: book }); } else {
            params.url = book.cover;
            params.encoding = "binary";
            request.get(params, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    book.cover64 = "data:" + response.headers["content-type"] + ";base64," + new Buffer(body, "binary").toString("base64");
                    defColor.resolve(book);
                } else {
                    defColor.reject({ error: error || "Invalid request", book: book });
                }
            });
        }
        return defColor.promise;
    };
/** Fin Gestion des Images  **/

/** Gestion des notifications **/
/**
    this.addNotif = function (mail, user, name, bookid, booktitle, callback) {
        notifs.insert({ _id: { to: mail, from: user, book: bookid }, isnew: true, date: new Date(), title: booktitle, name: name }, function (err, success) {
            if (!!err) { return callback(err, null); }
            return callback(null, success);
        });
    };

    this.notifRead = function (notif, callback) {
        notifs.update({ _id: notif }, {$set: { isnew: false }}, function (err, success) {
            if (!!err) { return callback(err, null); }
            return callback(null, success);
        });
    };

    this.removeNotifs = function (query, callback) {
        notifs.remove(query, function (err, success) {
            if (!!err) { return callback(err, null); }
            return callback(null, success);
        });
    };
/** Fin Gestion des notifications **/
};
