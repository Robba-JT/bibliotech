"use strict";

require(["lodash", "Thief", "dom", "emitter", "Request", "errors", "store", "biblioHdb"], function () {
    require(["profile", "cloud", "collection", "footer", "menu", "search", "detail", "firebase"], function () {
        if ("FileReader" in window && "formNoValidate" in document.createElement("input")) {
            em.emit("init");
        } else {
            window.location.href = "/logout";
        }
    });
});
