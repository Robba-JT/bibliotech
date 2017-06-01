"use strict";

define("notifications", ["json!../config-firebase.json"], function (config) {
    firebase.initializeApp(config);
    var messaging = firebase.messaging(),
        longPoll = function longPoll() {
        req("notification").long().then(function (notif) {
            console.log("notif", notif);
            em.emit("notif", notif);
            return longPoll();
        }).catch(function () {
            return longPoll();
        });
    };

    messaging.requestPermission().then(function () {
        return messaging.getToken();
    }).then(function (token) {
        console.log("token", token);
    }).catch(function (error) {
        err.add(error);
        longPoll();
    });
});
