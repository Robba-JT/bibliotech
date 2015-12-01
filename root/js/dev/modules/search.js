(function () {
	"use strict";
    var app = angular.module("search", []);
    app.directive("search", function () {
        return {
            restrict: "A",
            templateUrl: "./html/search.html",
            controller: ["$scope", "$socket", "$idb", function (scope, socks, idb) {
                var search = scope.search = { "result": { "search": "", "by": "", "lang": "fr" }};
                search.reset = function () { search.result = { "search": "", "by": "", "lang": "fr" }; };
                search.send = function () {
                    scope.windows.close("*");
                    scope.navbar.isCollect = false;
                    scope.navbar.filtre = search.last = scope.tags.last = null;
                    if (document.one(".sortBy")) { document.one(".sortBy").toggleClass("sortBy", false); }
                    if (!_.isEqual(this.result, this.last)) {
                        scope.bookcells.reset().then(function () {
                            search.last = search.result;
                            idb.getQuery(search.result)
                                .then(function (cells) {
                                    search.reset();
                                    scope.bookcells.cells = cells;
                                    _.assign(scope.waiting, { "screen": false, "icon": false, "anim": false });
                                })
                                .catch(function () {
                                    socks.emit("searchBooks", search.last);
                                    search.reset();
                                });
                        });
                    }
                };
                search.associated = function () {
                    var query = { "associated": scope.detail.book.id, "search": scope.detail.book.title };
                    scope.windows.close("*");
                    scope.navbar.isCollect = false;
                    scope.navbar.filtre = search.last = scope.tags.last = null;
                    if (document.one(".sortBy")) { document.one(".sortBy").toggleClass("sortBy", false); }
                    if (!_.isEqual(query, this.last)) {
                        scope.bookcells.reset().then(function () {
                            search.last = query;
                            idb.getQuery(query)
                                .then(function (cells) {
                                    search.reset();
                                    search.cells = cells;
                                    _.assign(scope.waiting, { "screen": false, "icon": false, "anim": false });
                                })
                                .catch(function () {
                                    socks.emit("associated", query.associated);
                                    search.reset();
                                });
                        });
                    }
                };
                search.recommanded = function () {
                    var query = { "recommand": scope.profile.user.id, "search": scope.trads.recommand4u };
                    scope.windows.close("*");
                    scope.navbar.isCollect = false;
                    scope.navbar.filtre = search.last = scope.tags.last = null;
                    if (document.one(".sortBy")) { document.one(".sortBy").toggleClass("sortBy", false); }
                    if (!_.isEqual(query, search.last)) {
                        scope.bookcells.reset().then(function () {
                            search.last = query;
                            idb.getQuery(query)
                                .then(function (cells) {
                                    search.reset();
                                    scope.bookcells.cells = cells;
                                    _.assign(scope.waiting, { "screen": false, "icon": false, "anim": false });
                                })
                                .catch(function () {
                                    socks.emit("recommanded");
                                    search.reset();
                                });
                        });
                    }
                };
            }]
        };
    });
})();
