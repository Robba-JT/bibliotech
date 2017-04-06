require.config({
    "paths": {
        "cells": "../modules/cells",
        "cloud": "../modules/cloud",
        "collection": "../modules/collection",
        "detail": "../modules/detail",
        "dom": "../lib/dom",
        "emitter": "../lib/emitter",
        "errors": "../lib/errors",
        "footer": "../modules/footer",
        "hdb": "../lib/handlebars.min",
        "lodash": "../lib/protoLodash",
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
            "exports": "em"
        },
        "Request": {
            "exports": "req"
        },
        "errors": {
            "exports": "err"
        }
    }
});

require(["lodash", "Thief", "dom", "emitter", "Request", "errors"], () => {
    require(["profile", "cloud", "collection", "footer", "menu", "search", "detail"], () => {
        if ("FileReader" in window && "formNoValidate" in document.createElement("input")) {
            em.emit("initProfile").emit("initCollect");
        } else {
            window.location.href = "/logout";
        }
    });
});
