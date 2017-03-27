require.config({
    "paths": {
        "Cell": "../modules/Cell",
        "collection": "../modules/collection",
        "dom": "../lib/dom",
        "footer": "../modules/footer",
        "handlebars": "../lib/handlebars.min",
        "lodash": "../lib/lodash.min",
        "profile": "../modules/profile",
        "Request": "../lib/Request",
        "search": "../modules/search",
        "text": "../lib/require-text.min"
    },
    "shim": {
        "lodash": {
            "exports": "_"
        }
    }
});
require(["dom", "collection", "profile", "search", "footer"], (µ, collection, profile) => {
    if ("FileReader" in window && "formNoValidate" in document.createElement("input")) {
        µ.many(".waiting, .roundIcon").toggleClass("notdisplayed", true);
        profile.init();
        collection.init();
    } else {
        window.location.href = "/logout";
    }
});
