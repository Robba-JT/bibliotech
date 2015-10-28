(function () {
    var app = angular.module("bookcells", []);
    app.directive("bookcells", function () {
        return {
            restrict: "A",
            templateUrl: "./html/bookcells.html",
            controller: ["$scope", "$socket", "$idb", function (scope, socks, idb) {
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
                            if (isCollection && isIn === -1) { bookcells.collection.push(cell); }
                        });
                    };

                bookcells.style = { "width": ~~(µ.one("[bookcells]").clientWidth / ~~(µ.one("[bookcells]").clientWidth / 256)) - ~~(µ.one("[bookcells]").clientWidth / 256) + "px" };

                bookcells.addBook = function (cell) {
                    if (_.findIndex(bookcells.collection, _.matchesProperty("id", cell.id)) === -1) {
                        _.assign(cell, { "inCollection": true });
                        if (!this.cell) { _.assign(_.find(bookcells.cells, _.matchesProperty("id", cell.id)), { "inCollection": true }); }
                        bookcells.collection.push(cell);
                        bookcells.collection = _.sortByOrder(bookcells.collection, "title");
                        if (!cell.new) {
                            socks.emit("addBook", cell.id);
                        } else if (!!scope.navbar.isCollect) {
                            bookcells.cells.push(cell);
                            if (!µ.one("#sort > div").hasClass("sortBy")) {
                                µ.one(".sortBy").toggleClass("sortBy", false);
                                µ.one("#sort > div").toggleClass("sortBy", true);
                            }
                            bookcells.cells =  _.sortByOrder(bookcells.cells, "title");
                        }
                    }
                };
                bookcells.removeBook = function (cell) {
                    _.remove(this.collection, _.matchesProperty("id", cell.id));
                    socks.emit("removeBook", cell.id);
                    if (!!scope.navbar.isCollect) { _.pull(this.cells, cell); } else { _.assign(cell, { "inCollection": false}); }
                };
                bookcells.reset = function () {
                    _.assign(scope.waiting, { "screen": true, "icon": true, "anim": true });
                    delete this.cells;
                    delete this.collection;
                    scope.tags.last = scope.navbar.filtre = scope.navbar.last = null;
                    µ.one("[bookcells]").css({ "top": µ.one("#navbar").clientHeight });
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
                    if (!!bookcells.cells) { bookcells.cells =  _.sortByOrder(bookcells.cells, "title"); }
                    if (!scope.windows.opened || _.isEmpty(scope.windows.opened)) { _.assign(scope.waiting,  { "screen": false }); }
                });
                socks.on("covers", function (covers) {
                    for (var jta = 0, lg = covers.length; jta < lg; jta++) {
                        var cell = _.find(bookcells.cells, _.matchesProperty("id", covers[jta].id)) || {},
                            inCollect = _.find(bookcells.collection, _.matchesProperty("id", covers[jta].id)) || {};

                        cell.base64 = inCollect.base64 = covers[jta].base64;
                        cell.alternative = inCollect.alternative = covers[jta].alternative;
                        if (scope.detail.book && scope.detail.book.id === covers[jta].id) {
                            scope.detail.book.base64 = covers[jta].base64;
                            scope.detail.book.alternative = covers[jta].alternative;
                        }
                    }
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
})();
