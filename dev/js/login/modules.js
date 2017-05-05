require.config({
    "paths": {
        "dom": "../lib/dom",
        "lodash": "../lib/lodash.min",
        "Request": "../lib/Request"
    },
    "shim": {
        "dom": {
            "exports": "µ"
        },
        "lodash": {
            "exports": "_"
        },
        "Request": {
            "exports": "req"
        }
    }
});
