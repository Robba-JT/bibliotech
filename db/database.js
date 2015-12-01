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
        }
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
                    "projection": "full",
                    "key": "AIzaSyBw0Wgo4DDJ48-dd7pC8DpryvOm_z8515A"
                };

            db.collection("covers").find({}, function (error, allCovers) {
                if (!!error) { return console.error("Covers removed", error); }
                db.collection("users").find({}, { "books.cover": true }).toArray(function (error, userBooks) {
                    if (!!error) { return console.error(error); }
                    var toRemoved = [];
                    userBooks = _.flattenDeep(_.pluck(userBooks, "books"));
                    allCovers.forEach(function (result) { if (_.findIndex(userBooks, { cover: result._id }) === -1) { toRemoved.push(result._id); }});
                    if (!!toRemoved.length) { removeCovers({ "_id": {"$in": toRemoved }}); }
                    console.info("Covers removed", toRemoved.length);
                });
            });

            db.collection("books").find({ "date": { $lte: last }, "id.user": { $exists: false }}, { "_id": false }).toArray(function (error, result) {
                if (!!error) { console.error("Error Update Books", error); }
                if (!!result) {
                    var updated = 0, removed = 0, requests = [];
                    _.forEach(result, function (oldOne) {
                        var params = _.merge({ volumeId: oldOne.id }, defParams);
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
        }
    });
};
