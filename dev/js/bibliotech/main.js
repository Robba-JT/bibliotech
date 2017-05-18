"use strict";

require(["lodash", "Thief", "dom", "emitter", "Request", "errors", "store", "biblioHdb"], function () {
    require(["profile", "cloud", "collection", "footer", "menu", "search", "detail"], function () {
        if ("FileReader" in window && "formNoValidate" in document.createElement("input")) {
            //em.emit("initProfile");
            //em.emit("initCollect");
            em.emit("init");
        } else {
            window.location.href = "/logout";
        }
    });
});
