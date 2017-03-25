/*const Q = require("q"),
    _ = require("lodash"),
    googleConfig = require("../google_client_config"),
    google = require("googleapis"),
    gAuth = google.auth.OAuth2,
    gBooks = google.books("v1"),
    gOptions = {
        "gzip": true,
        "headers": {
            "Accept-Encoding": "gzip",
            "Content-Type": "application/json"
        }
    },
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
        },
updateAllBooks = function () {
    var last = (new Date(((new Date()).setDate((new Date()).getDate() - 30))));
    db_books.find({ "date": { "$lte": last }, "id.user": { "$exists": false }}, { "_id": false }).toArray(function (error, result) {
        if (error) {
            console.error("Error Update Books", error);
        }
        if (!!result) {
            var updated = 0, removed = 0, requests = [];
            result.forEach(function (oldOne) {
                var params = _.merge({ "volumeId": oldOne.id }, reqParams.searchOne);
                requests.push(new Q.Promise(function () {
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
