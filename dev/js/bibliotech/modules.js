require.config({
    "paths": {
        "cells": "../modules/cells",
        "cloud": "../modules/cloud",
        "cjson": "../lib/cjson.min",
        "collection": "../modules/collection",
        "detail": "../modules/detail",
        "dom": "../lib/dom",
        "emitter": "../lib/emitter",
        "errors": "../lib/errors",
        "firebase": "../modules/firebase",
        "footer": "../modules/footer",
        "hdb": "../lib/handlebars.min",
        "biblioHdb": "../modules/biblioHdb",
        "json": "../lib/require-json.min",
        "lodash": "../lib/lodash",
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
            "deps": ["./lib/lodash.min"],
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
