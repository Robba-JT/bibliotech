if (!window.FileReader || !window.Promise || !("formNoValidate" in document.createElement("input"))) {
    alert(document.body.getAttribute("error"));
} else {
    var µ = document,
        app = angular.module("bibliotech", []);

    app.config(["$interpolateProvider", "$sceProvider", function(interpolateProvider, sceProvider) {
        interpolateProvider.startSymbol("[{");
        interpolateProvider.endSymbol("}]");
        sceProvider.enabled(false);
    }]);
    app.run(["$rootScope", "$http", "$window", function (root, http, win) {
        win.localStorage.clear();
        http.post("/trad", { "from": "login" }).then(function (result) { root.trads = result.data; });
        root.waiting = false;
        root.$on('$locationChangeStart', function(event, next, current) {
            if (win.localStorage.token) {
                console.debug("event", event);
                console.debug("next", next);
                console.debug("current", current);
            }
        });
    }]);
    app.directive("defCloak", ["$timeout", function (timeout) {
        return {
            "restrict": "A",
            "link": { "post": function (scope, element, attrs) {
                timeout(function () { attrs.$set("defCloak", undefined); element.removeClass("def-cloak"); });
            }}
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
                    if (!root.new) { return true; }
                    if (!scope.notEquals) { return modelValue === scope.otherModelValue; } else { return modelValue !== scope.otherModelValue; }
                };
                scope.$watch("otherModelValue", function() { ngModel.$validate(); });
            }
        };
    }]);
    app.directive("login", [function () {
        return {
            "restrict": "A",
            templateUrl: "./html/form.html",
            "controller": ["$scope", "$http", "$window", function (scope, http, win) {
                var user = scope.user = {},
                    razError = function () {
                        delete scope.error;
                        delete scope.success;
                    };

                scope.submit = function () {
                    scope.waiting = true;
                    razError();
                    http.post(this.new ? "/new" : "/login", user).then(function (result) {
                        if (result.data && result.data.success) {
                            win.location.reload(true);
                        } else {
                            scope.error = result.data.error;
                            user.password = null;
                            scope.waiting = false;
                        }
                    });
                };

                angular.element(µ.one("[type=button]")).on("click", function () {
                    razError();
                    user.name = null;
                    user.confirm = null;
                    scope.new = !scope.new;
                    scope.$apply();
                });
                angular.element(µ.one("#f")).on("click", function () {
                    window.location = "/gAuth";
                });
                angular.element(µ.one(".m")).on("click", function () {
                    razError();
                    scope.waiting = true;
                    http.post("/mail", user).then(function (result) {
                        scope.waiting = false;
                        scope.error = result.data.error;
                        scope.success = result.data.success;
                    });
                });
            }]
        };
    }]);
}
