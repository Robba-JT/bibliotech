define("firebase", ["json!../config-firebase.json"], function (config) {
    firebase.initializeApp(config);
    const messaging = firebase.messaging();
    messaging.requestPermission().then(() => messaging.getToken()).then((token) => {
        console.log("token", token);
    }).catch((error) => {
        err.add(error);
        //setInterval(() => em.emit("getNotifs"), 30000);
    });
});
