if (!window.FileReader || !("formNoValidate" in document.createElement("input"))) {
    document.getElementsByClassName("k")[0].parentNode.style.display = "none";
} else {
    var µ = document,
        app = angular.module("bibliotech", []);

    app.config(["$interpolateProvider", "$sceProvider", function(interpolateProvider, sceProvider) {
        interpolateProvider.startSymbol("[{");
        interpolateProvider.endSymbol("}]");
        sceProvider.enabled(false);
    }]);
    app.run(["$rootScope", "$http", function (root, http) {
        http.post("/trad", { "from": "login" }).then(function (result) { root.trads = result.data; });
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
    app.directive("login", ["$timeout", function (timeout) {
        return {
            "restrict": "A",
            templateUrl: "./html/form.html",
            "link": function (scope, element, attrs) {
                timeout(function () {
                    element.removeClass("notdisplayed");
                    scope.ready = true;
                });
            },
            "controller": ["$scope", "$http", "$window", function (scope, http, win) {
                var user = scope.user = {},
                    razError = function () {
                        delete scope.error;
                        delete scope.success;
                    };

                scope.submit = function () {
                    scope.ready = false;
                    razError();
                    http.post(this.new ? "/new" : "/login", user).then(function (result) {
                        if (result.data && result.data.success) {
                            win.location.reload(true);
                        } else {
                            scope.error = result.data.error;
                            user.password = null;
                            scope.ready = true;
                        }
                    });
                };

                angular.element(µ.one("[type=button]")).bind("click", function () {
                    razError();
                    user.name = null;
                    user.confirm = null;
                    scope.new = !scope.new;
                    scope.$apply();
                });
                angular.element(µ.one("#f")).bind("click", function () {
                    window.location = "/gAuth";
                });
                angular.element(µ.one(".m")).bind("click", function () {
                    razError();
                    scope.ready = false;
                    http.post("/mail", user).then(function (result) {
                        scope.ready = true;
                        scope.error = result.data.error;
                        scope.success = result.data.success;
                    });
                });
            }]
        };
    }]);
}
