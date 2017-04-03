require.config({
    "paths": {
        "cells": "../modules/cells",
        "cloud": "../modules/cloud",
        "collection": "../modules/collection",
        "dom": "../lib/dom",
        "emitter": "../lib/emitter",
        "errors": "../lib/errors",
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
            "exports": "µ",
            "deps": ["lodash"]
        },
        "emitter": {
            "exports": "em",
            "deps": ["lodash"]
        },
        "Request": {
            "exports": "req",
            "deps": ["lodash"]
        },
        "errors": {
            "exports": "err",
            "deps": ["lodash"]
        }
    }
});

require(["lodash", "Thief", "dom", "emitter", "Request", "errors"], () => {
    require(["profile", "cloud", "collection", "footer", "menu", "search"], () => {
        if ("FileReader" in window && "formNoValidate" in document.createElement("input")) {
            µ.many(".waiting, .roundIcon").toggleClass("notdisplayed", true);
            em.emit("initProfile").emit("initCollect");
        } else {
            window.location.href = "/logout";
        }
    });
});
