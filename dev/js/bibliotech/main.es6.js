require(["lodash", "Thief", "dom", "emitter", "Request", "errors", "store", "biblioHdb"], () => {
    require(["profile", "cloud", "collection", "footer", "menu", "search", "detail", "notifications"], () => {
        if ("FileReader" in window && "formNoValidate" in document.createElement("input")) {
            em.emit("init");
        } else {
            window.location.href = "/logout";
        }
    });
});
