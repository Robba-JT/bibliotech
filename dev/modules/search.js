define("search", ["lodash", "dom", "Request", "Cell", "text!../templates/search"], function (_, µ, request, Cell, template) {
    const window = µ.one("search").set("innerHTML", template);

    window.one("form").observe("submit", function (event) {
        event.preventDefault();
        request("/search", "POST").send(this.parser()).then((result) => {
            console.log("result", result);
            _.forEach(result, Cell);
        }).catch((error) => {
            console.error("error", error);
        });
        this.reset();
    });

    window.one(".closeWindow").observe("click", () => {
        window.toggleClass("notdisplayed");
        window.one("[type=search]").set("value", "");
    });

    window.one("#recommand4u input").observe("click", () => {
        _.noop();
    });
});
