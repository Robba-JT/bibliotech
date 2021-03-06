"use strict";

define("notifications", ["json!../config-firebase.json"], function (config) {
    var longPoll = function longPoll() {
        req("notification").long().then(function (notif) {
            console.log("notif", notif);
            em.emit("notif", notif);
            return longPoll();
        }).catch(function (error) {
            var timeout = error.type === "timeout" ? 0 : 3000;
            setTimeout(longPoll, timeout);
        });
    };
    try {
        firebase.initializeApp(config);
        var messaging = firebase.messaging();

        messaging.requestPermission().then(function () {
            return messaging.getToken();
        }).then(function (token) {
            console.log("token", token);
        }).catch(function (error) {
            err.add(error);
            longPoll();
        });
    } catch (error) {
        err.add(error);
        longPoll();
    }
});
