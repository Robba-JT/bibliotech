require.config({
    "paths": {
        "cells": "../modules/cells",
        "collection": "../modules/collection",
        "dom": "../lib/dom",
        "emitter": "../lib/emitter",
        "footer": "../modules/footer",
        "hdb": "../lib/handlebars.min",
        "lodash": "../lib/lodash.min",
        "menu": "../modules/menu",
        "profile": "../modules/profile",
        "Request": "../lib/Request",
        "search": "../modules/search",
        "text": "../lib/require-text.min",
        "Thief": "../lib/color-thief.min",
        "Window": "../modules/Window"
    },
    "shim": {
        "lodash": {
            "exports": "_"
        },
        "Thief": {
            "exports": "ColorThief"
        },
        "dom": {
            "exports": "µ"
        },
        "emitter": {
            "exports": "emitter"
        },
        "Request": {
            "exports": "request"
        }
    }
});

require(["lodash", "Thief", "dom", "emitter", "Request"], () => {
    require(["collection", "footer", "menu", "profile", "search"], () => {
        if ("FileReader" in window && "formNoValidate" in document.createElement("input")) {
            µ.many(".waiting, .roundIcon").toggleClass("notdisplayed", true);
            emitter.emit("initProfile").emit("initCollect");
        } else {
            window.location.href = "/logout";
        }
    });
});
