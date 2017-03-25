require.config({
    "paths": {
        "dom": "../lib/dom",
        "Request": "../lib/Request",
        "lodash": "../lib/lodash.min"
    },
    "shim": {
        "lodash": {
            "exports": "_"
        }
    }
});
require(["lodash", "dom", "Request"], (_, µ, request) => {
    if ("FileReader" in window && "formNoValidate" in document.createElement("input")) {
        µ.many(".w, .k, [login]").toggleClass("notdisplayed");
        µ.one("form").observe("submit", function (event) {
            event.preventDefault();
            µ.many(".w, .k").toggleClass("notdisplayed");
            const parser = _.omit(this.parser(), "confirm");
            µ.one(".g").text = "";
            request(this.get("action"), this.get("method")).send(parser).then(() => {
                window.location.reload(true);
            }).catch((error) => {
                µ.one(".g").text = _.get(error, "error") || error;
                µ.many(".w, .k").toggleClass("notdisplayed");
            });
            return false;
        });
        µ.one("#f").observe("click", () => {
            window.location = "/gAuth"
        });
        µ.one("[type=button]").observe("click", function () {
            const form = µ.one("form"),
                action = form.get("action"),
                alt = this.get("alt"),
                value = this.get("value");

            this.set({
                "value": alt,
                "alt": value
            });
            form.set({
                "action": action === "/login" ? "/new" : "/login",
                "method": action === "/login" ? "PUT" : "POST"
            });
            µ.many("[name=name], [name=confirm]")
                .toggleClass("notdisplayed")
                .set({
                    "value": "",
                    "required": action === "/login"
                });
            µ.many(".error").toggleClass("notdisplayed", true);
        });
        µ.one("[name=confirm]").observe("change", function () {
            const thisValue = this.get("value"),
                pwdValue = µ.one("[name=password]").get("value");

            µ.one("#c").toggleClass("notdisplayed", thisValue && thisValue !== pwdValue);
        });
    } else {
        document.getElementsByClassName("k")[0].parentNode.style.display = "none";
    }
});
