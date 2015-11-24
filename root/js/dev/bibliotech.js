if (!window.FileReader || !("formNoValidate" in document.createElement("input"))) {
    document.getElementsByClassName("roundIcon")[0].style.display = document.getElementsByClassName("waiting")[0].style.display = document.getElementsByClassName("waitAnim")[0].style.display = "none";
} else {
    var start = new Date(),
        µ = document,
        app = angular.module("bibliotech", ["navbar", "search", "profile", "bookcells", "detail"]);

    app.config(["$interpolateProvider", "$sceProvider", function(interpolateProvider, sceProvider) {
        interpolateProvider.startSymbol("[{");
        interpolateProvider.endSymbol("}]");
        sceProvider.enabled(false);
    }]);
    app.run(["$rootScope", "$http", "$window", "$timeout", function (scope, http, win, timeout) {
        http.post("/trad", { "from": "bibliotech" }).then(function (result) { scope.trads = result.data; });
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
                    "top": win.scrollY || µ.documentElement.scrollTop,
                    "left": win.scrollX || µ.documentElement.scrollLeft
                };
            }
        };
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
                    scope.bookcells.width = ~~(µ.one("[bookcells]").clientWidth / ~~(µ.one("[bookcells]").clientWidth / 256)) - ~~(µ.one("[bookcells]").clientWidth / 256) + "px";
                    scope.bookcells.iwidth = ~~(µ.one("[bookcells]").clientWidth / ~~(µ.one("[bookcells]").clientWidth / 256)) - ~~(µ.one("[bookcells]").clientWidth / 256) - 20 + "px";
                    scope.windows.close("*");
                    scope.tags.reset();
                }).then(function () {
                    scope.navbar.height = µ.one("#navbar").clientHeight;
                });
            }).bind("scroll", function () {
                scope.$apply(scope.footer = (!!scope.windows.xcroll().top));
            }).bind("click", function (event) {
                scope.modal.navBottom = µ.one("#navbar").clientHeight + 5;
                scope.modal.sortLeft = µ.one("#tris").offsetLeft;
                scope.modal.notifsLeft = µ.one("#notifications").offsetLeft;
                if (event.target.id !== "tris") { scope.modal.sort = false; }
                if (event.target.id !== "notifications") { scope.modal.notifs = false; }
                if (!event.target.getAttribute("nav")) { scope.context.show = false; }
                scope.$apply();
            }).bind("keypress, keydown", function (event) {
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

        angular.element(µ.one("#footer")).bind("click", function () {
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
        return {
            "getColor": new ColorThief().getColor,
            "getPalette": new ColorThief().getPalette
        };
    });
    app.factory("$idb", function() {
        return {
            "deleteDetail": function (bookid) {
                if (!this.db) { return; }
                this.db.transaction(["details"], "readwrite").objectStore("details").delete(bookid);
            },
            "deleteQuery": function (key) {
                if (!this.db) { return; }
                this.db.transaction(["queries"], "readwrite").objectStore("queries").delete(key);
            },
            "getDetail": function (bookid) {
                var self = this;
                if (_.isPlainObject(bookid)) { bookid = JSON.stringify(bookid); }
                return new Promise(function (resolve) {
                    if (!self.db) { resolve(); }
                    var request = self.db.transaction(["details"], "readwrite").objectStore("details").index("by_id").get(bookid);
                    request.onsuccess = function () { if (!!this.result) { resolve(this.result); } else { resolve(); }};
                    request.onerror = function () { resolve(); };
                });
            },
            "getQuery": function (key) {
                var self = this;
                return new Promise(function (resolve, reject) {
                    if (!self.db) { reject(); }
                    var request = self.db.transaction(["queries"], "readwrite").objectStore("queries").index("by_query").get(JSON.stringify(key));
                    request.onsuccess = function () {
                        if (!!this.result && !!this.result.books && !!this.result.books.length) {
                            resolve(this.result.books);
                        } else {
                            reject();
                        }};
                    request.onerror = reject;
                });
            },
            "init": function (session) {
                var self = this;
                this.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
                return new Promise(function (resolve, reject) {
                    if (!!self.indexedDB) {
                        var request = self.indexedDB.open(session, 1);
                        request.onerror = function () { reject(); };
                        request.onsuccess = function () {
                            console.info("DB Opened", new Date().toLocaleString());
                            self.db = this.result;
                            resolve();
                        };
                        request.onupgradeneeded = function() {
                            var db = this.result;
                            db.createObjectStore("queries", { "keyPath": "query" }).createIndex("by_query", "query", { "unique": true });
                            db.createObjectStore("details", { "keyPath": "id" }).createIndex("by_id", "id", { "unique": true });
                            console.info("DB Updated", new Date().toLocaleString());
                        };
                    }
                });
            },
            "setDetail": function (book) {
                if (!this.db) { return; }
                var request = this.db.transaction(["details"], "readwrite").objectStore("details").put(book);
            },
            "setQuery": function (key, value) {
                if (!this.db) { return; }
                var request = this.db.transaction(["queries"], "readwrite").objectStore("queries").put({ "query": JSON.stringify(key), "books": value });
            }
        };
    });
    app.factory("$socket", ["$rootScope", "$timeout", function(root, timeout) {
        var mouseMove = function (event) {
                µ.one("#noConnect").css({
                    "top": (noConnect.clientHeight + event.clientY > window.innerHeight) ? event.clientY - noConnect.clientHeight: event.clientY,
                    "left": (noConnect.clientWidth + event.clientX > window.innerWidth) ? event.clientX - noConnect.clientWidth: event.clientX
                });
            },
            execEvent = function (socket, callback) {
                return callback ? function () {
                    var args = arguments;
                    timeout(function () { callback.apply(socket, args); }, 0);
                } : angular.noop;
            },
            onQueue = {
                "on": [],
                "emit": []
            },
            $socket = (function () {
                var addListener = function (eventName, callback) {
                        connection.on(eventName, function() {
                            var args = arguments;
                            root.$apply(function() { callback.apply(connection, args); });
                        });
                    },
                    connect = function () {
                        var conn = io.connect({ "secure": true, "multiplex": false });
                        conn
                            .on("error", function (error) { console.error("error", error); root.logout(); })
                            .once("connect", function () {
                                _.assign(root.waiting, { "connect": false });
                                console.info("socket.connect", this, new Date().toLocaleString(), (new Date() - start) / 1000);
                                this.emit("isConnected");
                                µ.removeEventListener("mousemove", mouseMove);
                                start = new Date();
                                this.once("disconnect", function (data) {
                                    console.info("socket.disconnect", this.id, new Object(this), new Date().toLocaleString(), data);
                                    reconnect(this);
                                    root.windows.close("*");
                                    root.bookcells.reset();
                                    delete root.bookcells.collection;
                                    angular.element(µ).bind("mousemove", mouseMove);
                                    setTimeout(function () { _.assign(root.waiting, { "connect": true }); }, 2000);
                                    root.$apply();
                                });
                                this.on("logout", root.logout);
                                for (var jta = 0, lg = onQueue.on.length; jta < lg; jta++) {
                                    addListener(onQueue.on[jta].event, onQueue.on[jta].callback);
                                }
                                for (jta = 0, lg = onQueue.emit.length; jta < lg; jta++) {
                                    connection.emit(onQueue.emit[jta].event, onQueue.emit[jta].data);
                                }
                                onQueue.emit.length = 0;
                            });
                        return conn;
                    },
                    reconnect = function (cur) {
                        var connectTimeInterval = setInterval(function () {
                            if (!!cur && !!cur.connected && cur.io.readyState === "open") {
                                clearInterval(connectTimeInterval);
                                cur.destroy();
                                connection = connect();
                            }
                            try { cur.connect(); } catch(error) { }
                        }, 3000);
                    },
                    connection = connect();

                return {
                    "on": function (eventName, callback) {
                        if (!connection || !connection.connected) {
                            onQueue.on.push({ "event": eventName, "callback": callback });
                        } else {
                            addListener(eventName, callback);
                        }
                    },
                    "emit": function (eventName, data) {
                        if (!connection || !connection.connected) {
                            onQueue.emit.push({ "event": eventName, "data": data });
                        } else {
                            connection.emit(eventName, data);
                        }
                    },
                    "close": function () {
                        connection.close();
                    }
                };
            })();
        return $socket;
    }]);
    app.factory("$preloader", ["$q", "$rootScope", function (q,rootScope) {
        var Preloader = function (imageLocations) {
            this.imageLocations = imageLocations;
            this.imageCount = this.imageLocations.length;
            this.loadCount = 0;
            this.errorCount = 0;
            this.states = {
                PENDING: 1,
                LOADING: 2,
                RESOLVED: 3,
                REJECTED: 4
            };
            this.state = this.states.PENDING;
            this.deferred = q.defer();
            this.promise = this.deferred.promise;
        };

        Preloader.preloadImages = function (imageLocations) {
            if (!Array.isArray(imageLocations)) { imageLocations = [imageLocations]; }
            var preloader = new Preloader(imageLocations);
            return(preloader.load());
        };

        Preloader.prototype = {
            constructor: Preloader,
            isInitiated: function isInitiated() {
                return this.state !== this.states.PENDING;
            },
            isRejected: function isRejected() {
                return this.state === this.states.REJECTED;
            },
            isResolved: function isResolved() {
                return this.state === this.states.RESOLVED;
            },
            load: function load() {
                if (this.isInitiated()) { return this.promise; }
                this.state = this.states.LOADING;
                for (var i = 0; i < this.imageCount; i++) { this.loadImageLocation(this.imageLocations[i]); }
                return this.promise;
            },
            handleImageError: function handleImageError(imageLocation) {
                this.errorCount++;
                if (this.isRejected()) { return; }
                this.state = this.states.REJECTED;
                this.deferred.reject(imageLocation);
            },
            handleImageLoad: function handleImageLoad( imageLocation ) {
                this.loadCount++;
                if (this.isRejected()) { return; }
                this.deferred.notify({
                    percent: Math.ceil( this.loadCount / this.imageCount * 100 ),
                    imageLocation: imageLocation
                });
                if (this.loadCount === this.imageCount) {
                    this.state = this.states.RESOLVED;
                    this.deferred.resolve(this.imageLocations);
                }
            },
            loadImageLocation: function loadImageLocation(imageLocation) {
                var preloader = this,
                    image = new Image();

                image.onload = function(event) {
                    rootScope.$apply(
                        function() {
                            preloader.handleImageLoad(event.target.src);
                            preloader = image = event = null;
                        }
                    );
                };
                image.onerror = function( event ) {
                    rootScope.$apply(
                        function() {
                            preloader.handleImageError(event.target.src);
                            preloader = image = event = null;
                        }
                    );
                };
                image.src = imageLocation;
            }
        };
        return(Preloader);
    }]);
    app.directive("drag", ["$rootScope", function(root) {
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
        return {
            "restrict": "A",
            "link": function (scope, element, attrs) { scope.$watch(attrs.autoFocus, function (test) { timeout(function () { if (!!test) { element[0].focus(); }}); }); }
        };
    }]);
    app.directive("description", ["$timeout", function (timeout) {
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
                            top = Math.max(window.innerHeight, µ.one("[bookcells]").clientHeight) - self.yposition() < height ? -(height / 3).toFixed(0) : (height / 3).toFixed(0),
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
    app.directive("defCloak", ["$timeout", function (timeout) {
        return {
            "restrict": "A",
            "link": { "post": function (scope, element, attrs) {
                timeout(function () {
                    attrs.$set("defCloak", undefined);
                    element.removeClass("def-cloak");
                });
            }}
        };
    }]);
}
