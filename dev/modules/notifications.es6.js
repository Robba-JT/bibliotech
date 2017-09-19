define("notifications", ["json!../config-firebase.json"], function (config) {
	const longPoll = function () {
		req("notification").long().then((notif) => {
			console.log("notif", notif);
			em.emit("notif", notif);
			return longPoll();
		}).catch(() => longPoll());
	};
    try {
	    firebase.initializeApp(config);
	    const messaging = firebase.messaging();

	    messaging.requestPermission().then(() => messaging.getToken()).then((token) => {
		    console.log("token", token);
	    }).catch((error) => {
		    err.add(error);
		    longPoll();
	    });
    } catch (error) {
        err.add(error);
	    longPoll();
    }
});
