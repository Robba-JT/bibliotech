(function () {
    "use strict";
    var app = angular.module("navbar", []);
    app.directive("navbar", function () {
        return {
            restrict: "A",
            templateUrl: "./html/navbar.html",
            controller: ["$socket", "$scope", "$window", "$idb", "$timeout", function (socks, scope, window, idb, timeout) {
                var navbar = scope.navbar = {},
                    tags = scope.tags = { "cloud": false },
                    modal = scope.modal = { "sort": false, "notifs": false },
                    notifs = scope.notifs = {},
                    sortBy = function () {
                        if (this.hasClass("sortBy")) { return; }
                        var by = this.getAttribute("by"), sort = this.getAttribute("sort");
                        scope.bookcells.cells = _.sortByOrder(scope.bookcells.cells, [by], sort !== "desc");
                        scope.$apply();
                        if (µ.one(".sortBy")) { µ.one(".sortBy").toggleClass("sortBy", false); }
                        this.toggleClass("sortBy", true);
                    };

                navbar.visible = true;
                navbar.height = µ.one("#navbar").clientHeight;
                navbar.newbook = function () {
                    scope.waiting.screen = true;
                    scope.detail.show({});
                };
                navbar.openUrl = function (url) { window.open(url); };
                navbar.mailTo = function () { µ.location.href = "mailto:admin@biblio.tech?subject=Bibliotech"; };
                navbar.collection = function () {
                    navbar.saveorder = false;
                    if (µ.one(".sortBy") && !µ.one("#sort > div").hasClass("sortBy")) { µ.one(".sortBy").toggleClass("sortBy", false); }
                    µ.one("#sort > div").toggleClass("sortBy", true);
                    window.scroll(0, 0);
                    if (!navbar.isCollect) {
                        scope.bookcells.reset().then(function () {
                            timeout(function () {
                                scope.bookcells.cells = angular.copy(_.sortByOrder(scope.bookcells.collection, "title"));
                                navbar.isCollect = true;
                            }).then(function () {
                                _.assign(scope.waiting, { "screen": false, "icon": false, "anim": false });
                            });
                        });
                    } else {
                        navbar.filtre = navbar.last = scope.search.last = scope.tags.last = null;
                        scope.bookcells.cells = _.sortByOrder(scope.bookcells.cells, "title");
                        _.forEach(scope.bookcells.cells, function (cell) { _.assign(cell, { "toHide": false, "toFilter": false}); });
                    }
                };
                navbar.filter = function () {
                    var filtre = this.filtre.toLowerCase().noAccent().noSpace().split(" ").sort(),
                        lg = filtre.length;

                    if (_.isEqual(filtre, this.last)) { return; }
                    this.last = filtre;
                    _.forEach(scope.bookcells.cells, function (cell) {
                        if (_.isEqual(filtre, [""])) { cell.toFilter = false; return; }
                        var test = (cell.title + " " +
                                (!!cell.subtitle ? cell.subtitle : "") + " " +
                                (!!cell.authors ? cell.authors.join(", ") : "") + " " +
                                cell.description).toLowerCase().noAccent().noSpace();
                        for (var jta = 0; jta < lg; jta++) {
                            if (test.indexOf(filtre[jta]) === -1) { cell.toFilter = true; return; }
                        }
                        cell.toFilter = false;
                    });
                };
                navbar.toggleMenu = function () {
                    timeout(this.visible = !this.visible).then(function () {
                        navbar.height = µ.one("#navbar").clientHeight;
                    });
                };
                navbar.saveOrder = function () {
                    var order = { "id": scope.tags.last, "order": _.pluck(_.filter(scope.bookcells.cells, function (cell) { return cell.toHide === false; }), "id") },
                        index = _.findIndex(scope.profile.user.orders, _.matchesProperty("id", order.id));

                    if (index !== -1) {
                        _.assign(scope.profile.user.orders[index], { "order": order.order });
                    } else {
                        order.new = true;
                        scope.profile.user.orders.push({ "id": order.id, "order": order.order });
                    }
                    socks.emit("orders", order);
                    navbar.saveorder = false;
                };

                tags.generate = function () {
                    var cloud = µ.one("#cloud"),
                        height = ~~(cloud.clientHeight / 2),
                        width = ~~(cloud.clientWidth / 2),
                        ratio = width / height,
                        step = 3.0,
                        µtags = [],
                        isOver = function(elem, others) {
                            var overlap = function(a, b) {
                                return (Math.abs(2.0 * a.offsetLeft + a.offsetWidth - 2.0 * b.offsetLeft - b.offsetWidth) < a.offsetWidth + b.offsetWidth) && (Math.abs(2.0 * a.offsetTop + a.offsetHeight - 2.0 * b.offsetTop - b.offsetHeight) < a.offsetHeight + b.offsetHeight);
                            };
                            for(var jta = 0, lg = others.length; jta < lg; jta++) { if (overlap(elem, others[jta])) { return true; }}
                            return false;
                        };

                    for (var jta = 0, lg = scope.tags.tags.length; jta < lg; jta++) {
                        var tag = scope.tags.tags[jta],
                            µtag = cloud.newElement("span", { "title": tag.weight, "class": "tag tag" + Math.min(~~(tag.weight / 5) + 1, 10) }).html(tag.text),
                            top = height - (µtag.clientHeight / 2),
                            left = width - (µtag.clientWidth / 2),
                            radius = 0,
                            angle = 6.28 * Math.random();

                        µtag.css({ "top": top, "left": left });
                        while(isOver(µtag, µtags)) {
                            radius += step;
                            angle += (jta % 2 === 0 ? 1 : -1) * step;
                            top = height + radius * Math.sin(angle) - (µtag.clientHeight / 2.0);
                            left = width - (µtag.clientWidth / 2.0) + (radius * Math.cos(angle)) * ratio;
                            µtag.css({ "top": top, "left": left });
                        }
                        µtags.push(µtag);
                    }
                    angular.element(cloud.alls("span")).bind("click", scope.tags.click);
                };
                tags.show = function () {
                    new Promise(function (resolve) { resolve(scope.windows.open("cloud", true)); })
                        .then(function () { if (!µ.alls("#cloud span").length) { scope.tags.generate(); } });
                };
                tags.click = function () {
                    scope.windows.close("*");
                    tags.search(this.html());
                    scope.$apply();
                };
                tags.search = function (tag) {
                    scope.tags.last = tag;
                    scope.windows.close("*");
                    navbar.saveorder = false;
                    window.scroll(0, 0);
                    navbar.filtre = navbar.last = "";
                    var order = _.find(scope.profile.user.orders, _.matchesProperty("id", tag));
                    for (var jta = 0, lg = scope.bookcells.cells.length; jta < lg; jta++) {
                        _.assign(scope.bookcells.cells[jta], { "toHide": !_.includes(scope.bookcells.cells[jta].tags, tag), "toFilter": false });
                    }
                    if (!!order && !!order.order) {
                        order.order.reverse();
                        for (jta = 0, lg = order.order.length; jta < lg; jta++) {
                            var cell = _.remove(scope.bookcells.cells, _.matchesProperty("id", order.order[jta]));
                            if (!!cell.length) { scope.bookcells.cells.splice(0, 0, cell[0]); }
                        }
                    }
                };
                tags.init = function () {
                    var tags = _.countBy(_.flatten(_.compact(_.pluck(scope.bookcells.collection, "tags")), true).sort()),
                        alls = [];

                    if (!!tags) {
                        var tagOptions = "";
                        _.forEach(tags, function (nb, tag) {
                            alls.push({ "text": tag, "weight": nb });
                            tagOptions += "<option>" + tag + "</option>";
                        });
                        µ.one("#tagsList").html(tagOptions);
                        this.tags = _.sortBy(alls, "weight").reverse();
                    }
                    µ.alls("#cloud span").removeAll();
                };
                tags.reset = function () { µ.alls("#cloud span").removeAll(); };

                socks.on("notifs", function (data) {
                    scope.notifs.notifs = data;
                });

                notifs.show = function (index) {
                    socks.emit("readNotif", _.pullAt(this.notifs, index)[0]);
                };

                angular.element(µ.alls("#sort > div")).bind("click", sortBy);
            }]
        };
    });
})();
