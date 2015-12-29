(function () {
	"use strict";
    var app = angular.module("bookcells", []);
    app.directive("bookcells", function () {
        return {
            restrict: "A",
            templateUrl: "./html/bookcells.html",
            controller: ["$scope", "$socket", "$idb", "$preloader", function (scope, socks, idb, preloader) {
                var bookcells = scope.bookcells = {},
                    cellsRender = function (cells, isCollection) {
                        if (!bookcells.cells) { bookcells.cells = []; }
                        if (!bookcells.collection) { bookcells.collection = []; }
                        _.forEach(cells, function (cell) {
                            var isIn = _.findIndex(bookcells.collection, _.matchesProperty("id", cell.id)),
                                notYet = _.findIndex(bookcells.cells, _.matchesProperty("id", cell.id)) === -1;

                            if (notYet) {
                                bookcells.cells.push(_.assign(bookcells.collection[isIn] || cell, {
                                    "index": bookcells.cells.length,
                                    "inCollection": isCollection || isIn !== -1
                                }));
                            }
                            if (isCollection && isIn === -1) { bookcells.collection.push(angular.copy(cell)); }
                        });
                    },
					loadCover = function (cover) {
						if (!cover) { return; }
						var inCollect = _.find(bookcells.collection, _.matchesProperty("id", cover.id)) || {},
							cell = _.find(bookcells.cells, _.matchesProperty("id", cover.id)) || {};

						inCollect.base64 = cell.base64 = cover.base64;
						inCollect.alternative = cell.alternative = cover.alternative;
						if (scope.detail.book && scope.detail.book.id === cover.id) {
							scope.detail.book.base64 = cover.base64;
							scope.detail.book.alternative = cover.alternative;
						}
					};

                bookcells.width = ~~(document.one("[bookcells]").clientWidth / ~~(document.one("[bookcells]").clientWidth / 256)) - ~~(document.one("[bookcells]").clientWidth / 256) + "px";
                bookcells.iwidth = ~~(document.one("[bookcells]").clientWidth / ~~(document.one("[bookcells]").clientWidth / 256)) - ~~(document.one("[bookcells]").clientWidth / 256) - 20 + "px";
                bookcells.addBook = function (cell) {
                    if (_.findIndex(bookcells.collection, _.matchesProperty("id", cell.id)) === -1) {
                        if (!this.cell) { _.assign(_.find(bookcells.cells, _.matchesProperty("id", cell.id)), { "inCollection": true }); }
                        bookcells.collection.push(cell);
                        bookcells.collection = _.sortBy(bookcells.collection, function (book) { return book.title.toLowerCase(); });
                        _.assign(cell, { "inCollection": true, "index": bookcells.collection.length - 1 });
                        if (!cell.new) {
                            socks.emit("addBook", cell.id);
                        } else if (!!scope.navbar.isCollect) {
                            bookcells.cells.push(cell);
                            if (!document.one("#sort > div").hasClass("sortBy")) {
                                document.one(".sortBy").toggleClass("sortBy", false);
                                document.one("#sort > div").toggleClass("sortBy", true);
                            }
                            bookcells.cells = _.sortBy(bookcells.cells, function (cell) { return cell.title.toLowerCase(); });
                        }
                    }
                };
                bookcells.removeBook = function (cell) {
                    _.remove(this.collection, _.matchesProperty("id", cell.id));
                    socks.emit("removeBook", cell.id);
                    if (!!cell.tags) { scope.tags.init(); }
                    if (!!scope.navbar.isCollect) { _.pull(this.cells, cell); } else {
                        _.assign(cell, {
                            "inCollection": false,
                            "tags": [],
                            "userNote": null,
                            "userComment": null,
                            "index": null
                        });
                    }
                };
                bookcells.reset = function () {
                    _.assign(scope.waiting, { "screen": true, "icon": true, "anim": true });
                    return new Promise(function (resolve) {
                        delete bookcells.cells;
                        scope.tags.last = scope.search.last = scope.navbar.filtre = scope.navbar.last = null;
                        document.one("[bookcells]").css({ "top": document.one("#navbar").clientHeight });
                        resolve();
                    });
                };

                socks.on("initCollect", function (part) {
                    _.assign(scope.waiting, { "icon": false, "anim": true });
                    if (!scope.windows.opened || _.isEmpty(scope.windows.opened)) { _.assign(scope.waiting,  { "screen": false }); }
                    cellsRender(part, true);
                });
                socks.on("endCollect", function (part) {
                    scope.navbar.isCollect = true;
                    scope.tags.init();
                    cellsRender(part, true);
                    _.assign(scope.waiting, { "icon": false, "anim": false });
                    if (!!bookcells.cells) { bookcells.cells = _.sortBy(bookcells.cells, function (cell) { return cell.title.toLowerCase(); }); }
                    if (!scope.windows.opened || _.isEmpty(scope.windows.opened)) { _.assign(scope.waiting,  { "screen": false }); }
                });
                socks.on("cover", loadCover);
                socks.on("covers", function (covers) {
					for (var jta = 0, lg = covers.length; jta < lg; jta++) { loadCover(covers[jta]); }
                });
                socks.on("books", function (part) {
                    cellsRender(part);
                    _.assign(scope.waiting, { "icon": false, "anim": true });
                    if (!scope.windows.opened || _.isEmpty(scope.windows.opened)) { _.assign(scope.waiting,  { "screen": false }); }
                });
                socks.on("returnAdd", function (data) {
                    var index = _.findIndex(bookcells.cells, _.matchesProperty("id", data.id));
                    if (index !== -1) { _.assign(bookcells.cells[index], data); } else { bookcells.cells.push(data); }
                });

                socks.on("endRequest", function (nb) {
                    console.debug("endRequest", nb);
                    if (!scope.navbar.isCollect && !!bookcells.lastSearch) { idb.setQuery(bookcells.lastSearch, bookcells.cells); }
                    _.assign(scope.waiting, { "icon": false, "anim": false });
                    if (!scope.windows.opened || _.isEmpty(scope.windows.opened)) { _.assign(scope.waiting,  { "screen": false }); }
                });

                scope.$on("dropEvent", function(evt, dragged, dropped) {
                    if (_.isEqual(dragged, dropped)) { return false; }
                    var indexDrag = _.findIndex(bookcells.cells, _.matchesProperty("id", dragged.id)),
                        toDrag = _.remove(bookcells.cells, dragged)[0],
                        indexDrop = _.findIndex(bookcells.cells, _.matchesProperty("id", dropped.id));

                    scope.navbar.saveorder = true;
                    if (indexDrag <= indexDrop) { indexDrop++; }
                    bookcells.cells.splice(indexDrop, 0, toDrag);
                    scope.$apply();
                });

            }],
            controllerAs: "bookcells"
        };
    });
	app.directive("defSrc", ["$window", "$preloader", function (win, preloader) {
		return {
			restrict: "A",
			link: function (scope, element, attrs) {
				delete scope.cell.source;
				scope.$watch("cell.alternative || cell.base64", function (newValue, oldValue) {
					if (!!newValue) {
						scope.$watch(function () {
							return (newValue !== oldValue || !scope.cell.source) && !!element[0].getBoundingClientRect().top && win.innerHeight > element[0].getBoundingClientRect().top;
						}, function (toShow) {
							if (!!toShow) {	preloader.preloadImages(newValue).then(function (result) {
								element[0].one(".cover").src = newValue;
								scope.cell.source = true;
							}); }
						});
					}
				});
			}
		};
	}]);
})();
