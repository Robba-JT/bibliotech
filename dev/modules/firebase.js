"use strict";

define("firebase", ["json!../config-firebase.json"], function (config) {
    firebase.initializeApp(config);
    var messaging = firebase.messaging();
    messaging.requestPermission().then(function () {
        return messaging.getToken();
    }).then(function (token) {
        console.log("token", token);
    }).catch(function (error) {
        return err.add(error);
    });
});
