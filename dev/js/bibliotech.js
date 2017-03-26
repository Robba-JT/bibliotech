require.config({
    "paths": {
        "Cell": "../modules/Cell",
        "collection": "../modules/collection",
        "dom": "../lib/dom",
        "handlebars": "../lib/handlebars.min",
        "lodash": "../lib/lodash.min",
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
require(["collection", "search"], (collection, search) => {
    if ("FileReader" in window && "formNoValidate" in document.createElement("input")) {
        collection.init().then(() => {
            console.log("collection", collection);
        });
        //search.detail("S4qSCgAAQBAJ");
    } else {
        window.location.href = "/logout";
    }
});
