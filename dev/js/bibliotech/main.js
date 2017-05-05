"use strict";

require(["lodash", "Thief", "dom", "emitter", "Request", "errors", "store", "biblioHdb"], function () {
    require(["profile", "cloud", "collection", "footer", "menu", "search", "detail"], function () {
        if ("FileReader" in window && "formNoValidate" in document.createElement("input")) {
            em.emit("initProfile").emit("initCollect");
        } else {
            window.location.href = "/logout";
        }
    });
});
