if (!window.FileReader || !("formNoValidate" in document.createElement("input"))) {
    document.getElementsByClassName("roundIcon")[0].style.display = document.getElementsByClassName("waiting")[0].style.display = document.getElementsByClassName("waitAnim")[0].style.display = "none";
} else {
    var start = new Date(),
        app = angular.module("bibliotech", ["preloader", "socket", "idb", "defcloak", "navbar", "search", "profile", "bookcells", "detail"]);

    app.config(["$interpolateProvider", "$sceProvider", function(interpolateProvider, sceProvider, socket) {
        "use strict";
        interpolateProvider.startSymbol("[{");
        interpolateProvider.endSymbol("}]");
        sceProvider.enabled(false);
    }]);
    app.run(["$rootScope", "$http", "$window", "$timeout", "$socket", "$idb", function (scope, http, win, timeout, socks, idb) {
        "use strict";
        http.get(["trads", document.documentElement.lang || "fr", "bibliotech.json"].join("/")).then(function (result) { scope.trads = result.data; });
        scope.waiting = {
            "screen": true,
            "over": false,
            "icon": true,
            "anim": true
        };
        scope.windows = {
            "opened": {},
            "top": 0,
            "close": function (win) {
                    if (win === "*") { this.opened = {}; } else { delete this.opened[win]; }
                    _.assign(scope.waiting, { "screen": !_.isEmpty(this.opened), "over": false });
                },
            "open": function (win, only) {
                if (!!only) { this.close("*"); }
                this.opened[win] = this.xcroll().top + 10;
                if (win !== "sort" && win !== "notifs") {
                    _.assign(scope.waiting, { "screen": true, "over": _.keys(this.opened).length > 1 });
                }
            },
            "xcroll": function () {
                return {
                    "top": win.scrollY || document.documentElement.scrollTop,
                    "left": win.scrollX || document.documentElement.scrollLeft
                };
            }
        };

        var mouseMove = function (event) {
            document.one("#noConnect").css({
                "top": (noConnect.clientHeight + event.clientY > window.innerHeight) ? event.clientY - noConnect.clientHeight: event.clientY,
                "left": (noConnect.clientWidth + event.clientX > window.innerWidth) ? event.clientX - noConnect.clientWidth: event.clientX
            });
        };
        scope.logout = function () {
							alert("logout");
            scope.waiting.screen = true;
            if (!!idb.indexedDB) { idb.indexedDB.deleteDatabase(scope.profile.user.session); }
            scope.profile.user = {};
            win.location.assign("/logout");
            socks.close();
            return false;
        };

        socks.connect(function () {
            _.assign(scope.waiting, { "connect": false });
            document.removeEventListener("mousemove", mouseMove);
        });
		socks.disconnect(function () {
            scope.windows.close("*");
            scope.bookcells.reset();
            delete scope.bookcells.collection;
            angular.element(document).bind("mousemove", mouseMove);
            timeout(function () { _.assign(scope.waiting, { "connect": true }); }, 2000);
            scope.$apply();
        });

        angular.element(win)
            .bind("selectstart", function (event) {
                event.preventDefault();
                if (!!event.target.tagName && !_.includes(["input", "textarea"], event.target.tagName.toLowerCase())) { return false; }
            })
            .bind("contextmenu", function (event) {
                event.preventDefault();
                return false;
            })
            .bind("resize", function () {
                timeout(function () {
                    scope.bookcells.width = ~~(document.one("[bookcells]").clientWidth / ~~(document.one("[bookcells]").clientWidth / 256)) - ~~(document.one("[bookcells]").clientWidth / 256) + "px";
                    scope.bookcells.iwidth = ~~(document.one("[bookcells]").clientWidth / ~~(document.one("[bookcells]").clientWidth / 256)) - ~~(document.one("[bookcells]").clientWidth / 256) - 20 + "px";
                    scope.windows.close("*");
                    scope.tags.reset();
                }).then(function () {
                    scope.navbar.height = document.one("#navbar").clientHeight;
                });
            }).bind("scroll", function () {
                scope.$apply(scope.footer = (!!scope.windows.xcroll().top));
            }).bind("click", function (event) {
                scope.modal.navBottom = document.one("#navbar").clientHeight + 5;
                scope.modal.sortLeft = document.one("#tris").offsetLeft;
                scope.modal.notifsLeft = document.one("#notifications").offsetLeft;
                if (event.target.id !== "tris") { scope.modal.sort = false; }
                if (event.target.id !== "notifications") { scope.modal.notifs = false; }
                if (!event.target.getAttribute("nav")) { scope.context.show = false; }
                scope.$apply();
            }).bind("keypress, keydown", function (event) {
                event = event || window.event;
                var action;
                if (!event.altKey) {
                    if (!event.ctrlKey) {
						if (event.keyCode === 8 && ["INPUT", "TEXTAREA"].indexOf(event.target.nodeName) === -1) {
							action = true;
						}
                        else if (event.keyCode === 27) {
                            scope.windows.close("*");
                            action = true;
                        }
                    } else {
                        if ([77, 76, 82, 80, 66, 69, 73, 72].indexOf(event.keyCode) !== -1 && scope.waiting.anim) { action = true; } else {
                            switch (event.keyCode) {
                                case 77: scope.navbar.toggleMenu(); action = true; break;
                                case 76: scope.logout(); action = true; break;
                                case 82: scope.windows.open("search", true); action = true; break;
                                case 80: scope.windows.open("profile", true); action = true; break;
                                case 66: scope.navbar.collection(); action = true; break;
                                case 69: scope.tags.show(); action = true; break;
                                case 73: scope.windows.open("contacts", true); action = true; break;
                                case 72: scope.windows.open("help", true); action = true; break;
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

        angular.element(document.one("#footer")).bind("click", function () {
            var timer = setInterval(function () {
                var scr = ((scope.windows.xcroll().top / 2) - 0.1).toFixed(1);
                win.scroll(0, scr);
                if (scr <= 0.1) {
                    win.scroll(0, 0);
                    clearInterval(timer);
                }
            }, 100);
        });
    }]);
    app.factory("$thief", function () {
        "use strict";
        return {
            "getColor": new ColorThief().getColor,
            "getPalette": new ColorThief().getPalette
        };
    });
    app.directive("drag", ["$rootScope", function(root) {
        "use strict";
        var dragStart = function (evt, element, dragStyle) {
                element.addClass(dragStyle);
                evt.dataTransfer.setData("id", evt.target.id);
                evt.dataTransfer.effectAllowed = "move";
            },
            dragEnd = function (evt, element, dragStyle) {
                element.removeClass(dragStyle);
            };

        return {
            "restrict": "A",
            "link": function(scope, element, attrs)  {
                attrs.$set("draggable", "true");
                scope.dragData = scope[attrs.drag];
                scope.dragStyle = attrs.dragstyle;
                element.on("dragstart", function(evt) {
                    root.draggedElement = scope.dragData;
                    dragStart(evt, element, scope.dragStyle);
                });
                element.bind("dragend", function(evt) {
                    dragEnd(evt, element, scope.dragStyle);
                });
            }
        };
    }]);
    app.directive("drop", ["$rootScope", function(root) {
        "use strict";
        var dragEnter = function (evt, element, dropStyle) {
                evt.preventDefault();
                element.addClass(dropStyle);
            }, dragLeave= function (evt, element, dropStyle) {
                element.removeClass(dropStyle);
            }, dragOver = function (evt) {
                evt.preventDefault();
            }, drop = function (evt, element, dropStyle) {
                evt.preventDefault();
                element.removeClass(dropStyle);
            };

        return {
            "restrict": "A",
            "link": function(scope, element, attrs)  {
                scope.dropData = scope[attrs.drop];
                scope.dropStyle = attrs.dropstyle;
                element.bind("dragenter", function(evt) {
                    dragEnter(evt, element, scope.dropStyle);
                });
                element.bind("dragleave", function(evt) {
                    dragLeave(evt, element, scope.dropStyle);
                });
                element.bind("dragover", dragOver);
                element.bind("drop", function(evt) {
                    drop(evt, element, scope.dropStyle);
                    root.$broadcast("dropEvent", root.draggedElement, scope.dropData);
                });
            }
        };
    }]);
    app.directive("compareTo", ["$rootScope", function (root) {
        "use strict";
        return {
            "restrict": "A",
            "require": "ngModel",
            "scope": {
                "otherModelValue": "=compareTo",
                "notEquals": "@"
            },
            "link": function (scope, element, attrs, ngModel) {
                ngModel.$validators.compareTo = function(modelValue) {
                    if (!scope.notEquals) { return modelValue === scope.otherModelValue; } else { return modelValue !== scope.otherModelValue; }
                };
                scope.$watch("otherModelValue", function() { ngModel.$validate(); });
            }
        };
    }]);
    app.directive("message", ["$rootScope", "$window", function (root, window) {
        "use strict";
        return {
            "restrict": "A",
            "scope": {
                "message": "@",
                "titre": "@",
                "callback": "=callback"
            },
            "link": function (scope, element, attrs) {
                element.on("click", function () {
                    var confirm = root.confirm = {};
                    confirm.titre = root.trads[scope.titre];
                    confirm.message = root.trads[scope.message];
                    confirm.callback = scope.callback;
                    confirm.top = root.windows.xcroll().top + window.innerHeight / 4;
                    confirm.left = window.innerWidth / 4;
                    root.windows.open("confirm");
                });
            }
        };
    }]);
    app.directive("autoFocus", ["$timeout", function(timeout) {
        "use strict";
        return {
            "restrict": "A",
            "link": function (scope, element, attrs) { scope.$watch(attrs.autoFocus, function (test) { timeout(function () { if (!!test) { element[0].focus(); }}); }); }
        };
    }]);
    app.directive("description", ["$timeout", function (timeout) {
        "use strict";
        return {
            "restrict": "A",
            "link": function (scope, element, attrs) {
                var thisScope = scope,
                    show = function (event) {
                        if (this.one(".description") || scope.noShow) { delete scope.noShow; return; }
                        if (!scope.cell.description) { return; }
                        var self = this,
                            index = scope.cell.description.indexOf(" ", 500),
                            title = scope.cell.title,
                            description = scope.cell.description.substr(0, Math.max(index, 500)) + ((index !== -1) ? "..." : ""),
                            width = self.clientWidth,
                            height = self.clientHeight,
                            top = Math.max(window.innerHeight, document.one("[bookcells]").clientHeight) - self.yposition() < height ? -(height / 3).toFixed(0) : (height / 3).toFixed(0),
                            left = window.innerWidth - (self.xposition() + width) < width ? -(width / 3).toFixed(0) : (width / 3).toFixed(0),
                            style = "top: " + top + "px; left: " + left + "px; width: " + width + "px;",
                            div = angular.element("<div class=\"description notdisplayed\" style=\"" + style + "\"><span>" + title + "</span><div>" + description + "</div></div>");

                        angular.element(self).append(div);
                        timeout(function () {
                            if (div) {
                                div.toggleClass("notdisplayed", false);
                                div.on("click", function () {
                                    scope.noShow = true;
                                    hide.call(self);
                                });
                            }
                        }, 1000);

                    },
                    hide = function (event) {
                        if (this.one(".description")) { this.removeChild(this.one(".description")); }
                    };

                element.on("mouseover", show);
                element.on("mouseleave", hide);
            }
        };
    }]);
}
