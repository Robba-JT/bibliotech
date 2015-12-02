var start = new Date(), app = angular.module("admin", ["preloader", "socket", "defcloak"]);
app.config(["$interpolateProvider", "$sceProvider", function(interpolateProvider, sceProvider, socket) {
    interpolateProvider.startSymbol("[{");
    interpolateProvider.endSymbol("}]");
    sceProvider.enabled(false);
}]);
app.run(["$rootScope", "$http", "$window", "$timeout", "$socket", "$preloader", function (scope, http, win, timeout, socks, preloader) {
    "use strict";
    scope.logout = function () {
        location.assign("/logout");
        socks.close();
        return false;
    };
    scope.orders = {};
    scope.show = {};

    socks.on("users", function (users) {
        scope.ref_user = users;
        scope.users = angular.copy(users);
    });
    socks.on("sessions", function (sessions) {
        scope.ref_session = sessions;
        scope.sessions = angular.copy(sessions);
    });
    socks.on("books", function (books, persos) {
        scope.ref_book = books;
        scope.ref_perso = persos;
        scope.books = angular.copy(books);
        scope.persos = angular.copy(persos);
        console.debug(persos);
    });
    socks.on("covers", function (covers) {
        scope.covers = covers;
        _.forEach(covers, function (cover) { preloader.preloadImages(cover.cover).then(function () {
            cover.source = { "background-image": "url(" + cover.cover + ")" };
        }); });
    });
    socks.on("comments", function (comments) {
        scope.ref_comment = comments;
        scope.comments = angular.copy(comments);
    });
    socks.on("notifications", function (notifications) {
        scope.ref_notification = angular.copy(notifications);
        scope.notifications = notifications;
    });
    socks.on("logs", function (logs) {
        scope.logs = logs;
    });

    angular.element(document.alls("h2 .titre")).bind("click", function () {
        scope.$apply(scope.show[this.parentNode.parentNode.getAttribute("type")] = !scope.show[this.parentNode.parentNode.getAttribute("type")]);
    });

    angular.element(document.one("#logout")).bind("click", function () {
        scope.logout();
    });

    angular.element(document.one("#footer")).bind("click", function () {
        var timer = setInterval(function () {
            var scr = (((win.scrollY || document.documentElement.scrollTop) / 2) - 0.1).toFixed(1);
            win.scroll(0, scr);
            if (scr <= 0.1) {
                win.scroll(0, 0);
                clearInterval(timer);
            }
        }, 100);
    });

    angular.element(document.alls("[field]")).bind("click", function () {
        var collection = this.parentNode.parentNode.getAttribute("type"),
            field = this.getAttribute("field");

        scope.orders[field] = !scope.orders[field];
        scope[collection] = _.sortBy(scope[collection], field);
        if (!!scope.orders[field]) { scope[collection].reverse(); }
        scope.$apply();
    });

    angular.element(win).bind("scroll", function () {
        scope.$apply(scope.footer = win.scrollY || document.documentElement.scrollTop);
    });

	angular.element(document.one("h1 div")).bind("click", function () {
		timeout(function () {
			delete scope.users;
			delete scope.sessions;
			delete scope.books;
			delete scope.persos;
			delete scope.covers;
			delete scope.comments;
			delete scope.notifications;
			delete scope.logs;
		}).then(function () { socks.emit("isConnected"); });
	});

}]);
app.directive("submit", ["$socket", function (socks) {
    "use strict";
    return {
        "restrict": "A",
        "link": { "post": function (scope, element, attrs) {
            var type = _.find(_.keys(scope), function (key) { return !_.startsWith(key, "$"); }),
                that = scope[type],
                ref = _.find(scope.$parent["ref_" + type], _.matchesProperty("_id", scope[type]._id));

            element.on("click", function () {
                socks.emit("update", {
                    "collection": type + "s",
                    "values": that
                });
                delete that.newPassword;
                ref = angular.copy(that);
                scope.$apply(scope.disable = true);
            });
            scope.$watch(function () { return scope[type]; }, function () { scope.disable = angular.equals(that, ref); }, true);
        }}
    }
}]);
app.directive("delete", ["$socket", function (socks) {
    "use strict";
    return {
        "restrict": "A",
        "link": function (scope, element, attrs) {
            var type = _.find(_.keys(scope), function (key) { return !_.startsWith(key, "$"); });
            element.on("click", function () {
                socks.emit("delete", {
                    "collection": type + "s",
                    "_id": scope[type]._id
                });
                scope.$apply(_.remove(scope.$parent[type + "s"], scope[type]));
            });
        }
    }
}]);
