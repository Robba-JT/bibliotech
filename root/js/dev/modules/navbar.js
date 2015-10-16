(function () {
    var app = angular.module("navbar", []);
    app.directive("navbar", function () {
        return {
            restrict: "A",
            templateUrl: "./html/navbar.html",
            controller: ["$socket", "$scope", "$window", "$idb", "$http", function (socks, scope, window, idb, http) {
                var navbar = scope.navbar = {},
                    tags = scope.tags = { "cloud": false },
                    windows = scope.windows = { "opened": {}, "top": 0 },
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

                scope.trads = {};
                scope.waiting = {
                    "screen": true,
                    "over": false,
                    "icon": true,
                    "anim": true
                };
                scope.onFocus = function (evt) {
                    console.debug(evt);
                    return true;
                };
                scope.windows.close = function (win) {
                    if (win === "*") { this.opened = {}; } else { delete this.opened[win]; }
                    _.assign(scope.waiting, { "screen": !_.isEmpty(this.opened), "over": false });
                };
                scope.windows.open = function (win, only) {
                    return new Promise(function (resolve) {
                        if (!!only) { windows.close("*"); }
                        windows.top = windows.xcroll().top + 10;
                        windows.opened[win] = true;
                        if (win !== "sort" && win !== "notifs") { _.assign(scope.waiting, { "screen": true, "over": _.keys(windows.opened).length > 1 }); }
                        resolve();
                    });
                };
                scope.windows.xcroll = function () {
                    return {
                        "top": window.scrollY || µ.documentElement.scrollTop,
                        "left": window.scrollX || µ.documentElement.scrollLeft
                    };
                };

                scope.logout = function () {
                    scope.waiting.screen = true;
                    if (!!idb.indexedDB) { idb.indexedDB.deleteDatabase(scope.profile.user.session); }
                    scope.profile.user = {};
                    location.assign("/logout");
                    socks.close();
                    return false;
                };

                http.get("/trad").then(function (result) { scope.trads = result.data; });

                navbar.visible = true;
                navbar.height = µ.one("#navbar").clientHeight;
                navbar.newbook = function () {
                    scope.waiting.screen = true;
                    scope.detail.show({});
                };
                navbar.openUrl = function (url) { window.open(url); };
                navbar.mailTo = function () { µ.location.href = "mailto:admin@biblio.tech?subject=Bibliotech"; };
                navbar.collection = function () {
                    _.assign(scope.waiting, { "screen": true, "icon": true });
                    if (!navbar.isCollect) {
                        scope.bookcells.reset();
                        scope.bookcells.cells = scope.bookcells.collection;
                        navbar.isCollect = true;
                    }
                    navbar.saveorder = false;
                    navbar.filtre = navbar.last = scope.search.last = scope.tags.last = null;
                    if (µ.one(".sortBy") && !µ.one("#sort > div").hasClass("sortBy")) { µ.one(".sortBy").toggleClass("sortBy", false); }
                    µ.one("#sort > div").toggleClass("sortBy", true);
                    scope.bookcells.cells = _.sortByOrder(scope.bookcells.cells, "title");
                    _.forEach(scope.bookcells.cells, function (cell) { _.assign(cell, { "toHide": false, "toFilter": false}); });
                    window.scroll(0, 0);
                    _.assign(scope.waiting, { "screen": false, "icon": false, "anim": false });
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
                    this.visible = !this.visible;
                    µ.one("[bookcells]").css({ "top": this.visible ? this.height : 0 });
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
                    cloud.alls("span").setEvents("click", scope.tags.click);
                };
                tags.show = function () {
                    new Promise(function (resolve) { resolve(windows.open("cloud", true)); })
                        .then(function () { if (!µ.alls("#cloud span").length) { scope.tags.generate(); } });
                };
                tags.click = function () {
                    windows.close("*");
                    tags.search(this.html());
                    scope.$apply();
                };
                tags.search = function (tag) {
                    scope.tags.last = tag;
                    windows.close("*");
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

                µ.one("[bookcells]").css({ "top": µ.one("#navbar").clientHeight });

                socks.on("notifs", function (data) {
                    scope.notifs.notifs = data;
                });

                notifs.show = function (index) {
                    socks.emit("readNotif", _.pullAt(this.notifs, index)[0]);
                };

                angular.element(window)
                    .on("selectstart", function (event) {
                        event.preventDefault();
                        if (!!event.target.tagName && !_.includes(["input", "textarea"], event.target.tagName.toLowerCase())) { return false; }
                    })
                    .on("contextmenu", function (event) {
                        event.preventDefault();
                        return false;
                    })
                    .on("resize", function () {
                        scope.bookcells.style = { "width": ~~(µ.one("[bookcells]").clientWidth / ~~(µ.one("[bookcells]").clientWidth / 256)) - 10 + "px" };
                        windows.close("*");
                        scope.tags.reset();
                        scope.$apply();
                    }).on("scroll", function () {
                        scope.footer = (!!scope.windows.xcroll().top);
                        scope.$apply();
                    }).on("click", function (event) {
                        scope.modal.navBottom = µ.one("#navbar").clientHeight + 5;
                        scope.modal.sortLeft = µ.one("#tris").offsetLeft;
                        scope.modal.notifsLeft = µ.one("#notifications").offsetLeft;
                        if (event.target.id !== "tris") { scope.modal.sort = false; }
                        if (event.target.id !== "notifications") { scope.modal.notifs = false; }
                        if (!event.target.getAttribute("nav")) { scope.context.show = false; }
                        scope.$apply();
                    }).on("keypress, keydown", function (event) {
                        event = event || window.event;
                        var action;
                        if (!event.altKey) {
                            if (!event.ctrlKey) {
                                if (event.keyCode === 27) {
                                    scope.windows.close("*");
                                    action = true;
                                }
                            } else {
                                if ([77, 76, 82, 80, 66, 69, 73, 72].indexOf(event.keyCode) !== -1 && scope.waiting.anim) { action = true; } else {
                                    switch (event.keyCode) {
                                        case 77: navbar.toggleMenu(); action = true; break;
                                        case 76: scope.logout(); action = true; break;
                                        case 82: windows.open("search", true); action = true; break;
                                        case 80: windows.open("profile", true); action = true; break;
                                        case 66: navbar.collection(); action = true; break;
                                        case 69: scope.tags.show(); action = true; break;
                                        case 73: windows.open("contacts", true); action = true; break;
                                        case 72: windows.open("help", true); action = true; break;
                                    }
                                }
                            }
                            if (!!action) {
                                event.preventDefault();
                                scope.$apply();
                                return false;
                            }
                        }
                    });

                angular.element(µ.one("#footer")).on("click", function () {
                    var timer = setInterval(function () {
                        var scr = ((scope.windows.xcroll().top / 2) - 0.1).toFixed(1);
                        window.scroll(0, scr);
                        if (scr <= 0.1) {
                            window.scroll(0, 0);
                            clearInterval(timer);
                        }
                    }, 100);
                });

                angular.element(µ.alls("#sort > div")).on("click", sortBy);
            }]
        };
    });
})();
