(function () {
    var app = angular.module("profile", []);
    app.directive("profile", function () {
        return {
            restrict: "A",
            templateUrl: "./html/profile.html",
            controller: ["$scope", "$socket", "$idb", function (scope, socks, idb) {
                var profile = scope.profile = {};

                profile.reset = function () { _.assign(this.user, { "pwd": "", "newPwd": "", "confirmPwd": "", "error": false }); };
                profile.send = function () { socks.emit("updateUser", this.user); };
                profile.delete = function () {
                    socks.emit("deleteUser", this.user);
                    scope.windows.close("*");
                };
                profile.import = function () {
                    socks.emit("importNow");
                    scope.windows.close("*");
                    _.assign(scope.waiting, { "screen": true, "icon": true, "anim": true });
                };
                profile.export = function () {
                    socks.emit("exportNow");
                    scope.windows.close("*");
                    _.assign(scope.waiting, { "screen": true, "icon": true });
                };

                socks.on("user", function (data) {
                    scope.waiting.screen = false;
                    profile.user = data;
                    if (data.link && data.picture && !µ.one("#picture").isVisible()) {
                        µ.one("#picture").css({ "background-image": "url(" + data.picture + ")" }).setEvents("click", function () {
                            window.open(data.link);
                        }).toggleClass("notdisplayed", false);
                    }
                    if (!data.connex) { scope.windows.open("help"); }
                    if (data.session) { idb.init(data.session); }
                });
                socks.on("updateUser", function (data) {
                    _.assign(profile.user, data);
                    scope.windows.close("profile");
                    profile.reset();
                });
                socks.on("updateNok", function () {
                    profile.reset();
                    profile.user.error = true;
                });
            }]
        };
    });
})();
