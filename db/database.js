var MongoClient = require("mongodb").MongoClient,
    google = require("googleapis"),
    gBooks = google.books("v1"),
    _ = require("lodash"),
    Q = require("q"),
    gOptions = {
        "gzip": true,
        "headers": {
            "Accept-Encoding": "gzip",
            "Content-Type": "application/json"
        },
		"timeout": 5000
    };

google.options(gOptions);

module.exports.init = function (mongoUrl, callback) {
    MongoClient.connect(mongoUrl, function (err, db) {
        "use strict";
        if (!!err) { callback(err); } else {
            module.exports.client = db;
            callback();

            var last = (new Date(((new Date()).setDate((new Date()).getDate() - 30)))),
                defParams = {
                    "fields": "id, etag, accessInfo(accessViewStatus), volumeInfo(title, subtitle, authors, publisher, publishedDate, description, industryIdentifiers, pageCount, categories, imageLinks, canonicalVolumeLink)",
                    "projection": "full"/*,
                    "key": "AIzaSyBw0Wgo4DDJ48-dd7pC8DpryvOm_z8515A"*/
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
						"cover": (!!bookinfos.imageLinks) ? bookinfos.imageLinks.small || bookinfos.imageLinks.medium || bookinfos.imageLinks.large || bookinfos.imageLinks.extraLarge || bookinfos.imageLinks.thumbnail || bookinfos.imageLinks.smallThumbnail : "",
						"access": (!!book.accessInfo) ? book.accessInfo.accessViewStatus : "NONE",
						"preview": (!!book.accessInfo) ? book.accessInfo.webReaderLink : "",
						"date": new Date()
					};
				},
				books = db.collection("books"),
				covers = db.collection("covers"),
				users = db.collection("users");

            covers.find().toArray(function (error, allCovers) {
                if (!!error) { return console.error("Covers removed", error); }
                users.find({}, { "books.cover": true }).toArray(function (error, userBooks) {
                    if (!!error) { return console.error(error); }
                    var toRemoved = [];
                    userBooks = _.flattenDeep(_.pluck(userBooks, "books"));
                    _.forEach(allCovers, function (cover) {
						if (_.findIndex(userBooks, { cover: cover._id }) === -1) { toRemoved.push(cover._id); }
					});
                    if (!!toRemoved.length) { covers.remove({ "_id": {"$in": toRemoved }}); }
                    console.info("Covers removed", toRemoved.length);
                });
            });

            books.find({ "date": { $lte: last }, "id.user": { $exists: false }}, { "_id": false }).toArray(function (error, result) {
                if (!!error) { console.error("Error Update Books", error); }
                if (!!result) {
                    var updated = 0, removed = 0, requests = [];
                    _.forEach(result, function (oldOne) {
                        var params = _.merge({ "volumeId": oldOne.id }, defParams);
                        requests.push(new Q.Promise(function () {
                            gBooks.volumes.get(params, function (error, response) {
                                if (!!error) {
                                    console.error("Error Update One", oldOne.id, error);
                                    if (error.code === 404 && error.message === "The volume ID could not be found.") {
                                        books.remove({ "id": oldOne.id });
                                        removed++;
                                    }
                                } else {
                                    var newOne = formatOne(response);
                                    if (!booksEqual(oldOne, newOne)) { updated++; }
                                    books.update({ "id": newOne.id }, newOne, { "upsert": true });
                                }
                            });
                        }));
                    });
                    Q.allSettled(requests).done(function () { console.info("Books updated", updated, "removed", removed); });
                }
            });
        }
    });
};
