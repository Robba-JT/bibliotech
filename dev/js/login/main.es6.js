require(["lodash", "dom", "Request"], () => {
    if ("FileReader" in window && "formNoValidate" in document.createElement("input")) {
        µ.many(".w, .k, [login]").toggleClass("notdisplayed");
        µ.one("form").observe("submit", function (event) {
            event.preventDefault();
            µ.many(".w, .k").toggleClass("notdisplayed", false);
            µ.one(".m").toggleClass("notdisplayed", true);
            µ.one(".g").text = "";
            req("login", µ.one("[name=confirm]").visible ? "POST" : "PUT").send(_.omit(this.parser(), "confirm"))
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
            const alt = this.get("alt"),
                value = this.value;

            this.set("alt", value).value = alt;
            µ.many("[name=name], [name=confirm]")
                .toggleClass("notdisplayed")
                .set("required", µ.one("[name=confirm]").visible).value = "";
            µ.many(".error").toggleClass("notdisplayed", true);
        });
        µ.many("[name=confirm], [name=password]").observe("keyup", function () {
            if (µ.one("[name=confirm]").visible) {
                const confirmValue = µ.one("[name=confirm]").value,
                    pwdValue = µ.one("[name=password]").value,
                    test = pwdValue && confirmValue && confirmValue === pwdValue;

                µ.one("[name=confirm]").valid = test;
                µ.one("#c").toggleClass("notdisplayed", test);
            }
        });
        µ.one("button.m").observe("click", function () {
            const elt = µ.one("[name=email]");
            if (elt.valid) {
                req("mail", "POST").send({
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
