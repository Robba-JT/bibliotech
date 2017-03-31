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
            µ.many(".w, .k").toggleClass("notdisplayed", false);
            µ.one(".m").toggleClass("notdisplayed", true);
            µ.one(".g").text = "";
            request(this.get("action"), "POST").send(_.omit(this.parser(), "confirm"))
                .then(() => window.location.reload(true))
                .catch((error) => {
                    µ.one(".g").text = _.get(error, "error") || error;
                    µ.many(".w, .k, .m").toggleClass("notdisplayed");
                });
            return false;
        });
        µ.one("#f").observe("click", () => {
            window.location = "/gAuth";
        });
        µ.one("[type=button]").observe("click", function () {
            const form = µ.one("form"),
                action = form.get("action"),
                alt = this.get("alt"),
                value = this.value;

            this.set("alt", value).value = alt;
            form.set({
                "action": action === "/login" ? "/new" : "/login"
            });
            µ.many("[name=name], [name=confirm]")
                .toggleClass("notdisplayed")
                .set("required", action === "/login").value = "";
            µ.many(".error").toggleClass("notdisplayed", true);
        });
        µ.one("[name=confirm]").observe("change", function () {
            const thisValue = this.value,
                pwdValue = µ.one("[name=password]").value;

            µ.one("#c").toggleClass("notdisplayed", thisValue && thisValue !== pwdValue);
        });
        µ.one("button.m").observe("click", function () {
            const elt = µ.one("[name=email]");
            if (elt.valid) {
                request("/mail", "POST").send({
                    "email": elt.value
                }).then(() => {
                    _.noop();
                }).catch((error) => {
                    µ.one(".g").text = _.get(error, "error") || error;
                });
            } else {
                elt.focus();
            }
        });
    } else {
        document.getElementsByClassName("k")[0].parentNode.style.display = "none";
    }
});
