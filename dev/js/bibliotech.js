require.config({
    "paths": {
        "cells": "../modules/cells",
        "cloud": "../modules/cloud",
        "cjson": "../lib/cjson",
        "collection": "../modules/collection",
        "detail": "../modules/detail",
        "dom": "../lib/dom",
        "emitter": "../lib/emitter",
        "errors": "../lib/errors",
        "footer": "../modules/footer",
        "hdb": "../lib/handlebars.min",
        "biblioHdb": "../modules/biblioHdb",
        "lodash": "../lib/protoLodash",
        "menu": "../modules/menu",
        "profile": "../modules/profile",
        "Request": "../lib/Request",
        "search": "../modules/search",
        "store": "../lib/storage",
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
        },
        "biblioHdb": {
            "deps": ["hdb"]
        },
        "store": {
            "deps": ["cjson"],
            "exports": "store"
        }
    }
});

require(["lodash", "Thief", "dom", "emitter", "Request", "errors", "store", "biblioHdb"], () => {
    require(["profile", "cloud", "collection", "footer", "menu", "search", "detail"], () => {
        if ("FileReader" in window && "formNoValidate" in document.createElement("input")) {
            em.emit("initProfile").emit("initCollect");
        } else {
            window.location.href = "/logout";
        }
    });
});
