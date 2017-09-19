require.config({
    "paths": {
        "cjson": "../lib/cjson.min",
        "dom": "../lib/dom",
        "emitter": "../lib/emitter",
        "errors": "../lib/errors",
        "hdb": "../lib/handlebars.min",
	    "json": "../lib/require-json.min",
        "lodash": "../lib/lodash",
        "Request": "../lib/Request",
        "store": "../lib/storage",
        "text": "../lib/require-text.min",
        "Thief": "../lib/color-thief.min"
    },
    "shim": {
        "dom": {
            "exports": "µ"
        },
        "emitter": {
            "exports": "em"
        },
        "errors": {
            "exports": "err"
        },
        "lodash": {
            "exports": "_",
            "deps": ["./lib/lodash.min"]
        },
        "Request": {
            "exports": "req"
        },
        "Thief": {
            "exports": "ColorThief"
        },
        "store": {
            "deps": ["cjson"],
            "exports": "store"
        }
    }
});
