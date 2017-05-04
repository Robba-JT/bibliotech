require.config({
    "paths": {
        "dom": "../lib/dom",
        "Request": "../lib/Request",
        "lodash": "../lib/lodash.min"
    },
    "shim": {
        "lodash": {
            "exports": "_"
        },
        "dom": {
            "exports": "µ"
        },
        "Request": {
            "exports": "req"
        }
    }
});
