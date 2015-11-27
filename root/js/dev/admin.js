var start = new Date(), µ = document, app = angular.module("admin", ["preloader", "socket", "defcloak"]);
app.config(["$interpolateProvider", "$sceProvider", function(interpolateProvider, sceProvider, socket) {
    interpolateProvider.startSymbol("[{");
    interpolateProvider.endSymbol("}]");
    sceProvider.enabled(false);
}]);
app.run(["$rootScope", "$http", "$window", "$timeout", "$socket", "$preloader", "$window", function (scope, http, win, timeout, socks, preloader, win) {
    scope.show = {};
    scope.logout = function () {
        location.assign("/logout");
        socks.close();
        return false;
    };
    scope.orders = {};

    socks.on("users", function (users) {
        scope.users = users;
    });
    socks.on("sessions", function (sessions) {
        scope.sessions = sessions;
    });
    socks.on("books", function (books, persos) {
        scope.books = books;
        scope.persos = persos;
    });
    socks.on("covers", function (covers) {
        scope.covers = covers;
        _.forEach(covers, function (cover) { preloader.preloadImages(cover.cover).then(function () {
            cover.source = { "background-image": "url(" + cover.cover + ")" };
        }); });
    });
    socks.on("comments", function (comments) {
        scope.comments = comments;
    });
    socks.on("notifications", function (notifications) {
        scope.notifications = notifications;
    });

    angular.element(µ.alls("h2")).bind("click", function () {
        scope.$apply(scope.show[this.parentNode.getAttribute("type")] = !scope.show[this.parentNode.getAttribute("type")]);
    });

    angular.element(µ.one("#logout")).bind("click", function () {
        scope.logout();
    });

    angular.element(µ.one("#footer")).bind("click", function () {
        var timer = setInterval(function () {
            var scr = (((win.scrollY || µ.documentElement.scrollTop) / 2) - 0.1).toFixed(1);
            win.scroll(0, scr);
            if (scr <= 0.1) {
                win.scroll(0, 0);
                clearInterval(timer);
            }
        }, 100);
    });

    angular.element(µ.alls("[field]")).bind("click", function () {
        var collection = this.parentNode.parentNode.getAttribute("type"),
            field = this.getAttribute("field");

        scope.orders[field] = !scope.orders[field];
        scope[collection] = _.sortBy(scope[collection], field);
        if (!!scope.orders[field]) { scope[collection].reverse(); }
        scope.$apply();
    });

    angular.element(win).bind("scroll", function () {
        scope.$apply(scope.footer = win.scrollY || µ.documentElement.scrollTop);
    });

}]);
app.directive("submit", ["$socket", function (socks) {
    return {
        "restrict": "A",
        "link": { "post": function (scope, element, attrs) {
            element.on("click", function () {
                var type = _.find(_.keys(scope), function (key) { return !_.startsWith(key, "$"); });
                socks.emit("update", {
                    "collection": type + "s",
                    "values": scope[type]
                });
            });
        }}
    }
}]);
app.directive("delete", ["$socket", function (socks) {
    return {
        "restrict": "A",
        "link": function (scope, element, attrs) {
            element.on("click", function () {
                var type = _.find(_.keys(scope), function (key) { return !_.startsWith(key, "$"); });
                socks.emit("delete", {
                    "collection": type + "s",
                    "_id": scope[type]._id
                });
                scope.$apply(_.remove(scope.$parent[type + "s"], scope[type]));
            });
        }
    }
}]);
