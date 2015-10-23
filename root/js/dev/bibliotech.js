if (!window.FileReader || !window.Promise || !("formNoValidate" in document.createElement("input"))) {
    alert(document.body.getAttribute("error"));
} else {
    var start = new Date(),
        µ = document,
        app = angular.module("bibliotech", ["navbar", "search", "profile", "bookcells", "detail"]);

    app.config(["$interpolateProvider", "$sceProvider", function(interpolateProvider, sceProvider) {
        interpolateProvider.startSymbol("[{");
        interpolateProvider.endSymbol("}]");
        sceProvider.enabled(false);
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
                        var request = indexedDB.open(session, 1);
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
                                    µ.setEvents({ "mousemove": mouseMove });
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
