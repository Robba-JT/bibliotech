if (!window.FileReader || !window.Promise || !("formNoValidate" in document.createElement("input"))) {
    document.one("div").toggleClass("notdisplayed");
    alert("Votre navigateur n'est pas compatible!!!");
} else {
    var µ = document,
        checkValid = function () {
            var n;
            this.setCustomValidity("");
            switch (this.name) {
                case "name":
                    n = this.isVisible() && this.value.length < 4;
                    break;
                case "password":
                    n = this.value.length < 4 || this.value.length > 12;
                    break;
                case "confirm":
                    n = this.isVisible() && this.value !== µ.one("[name=password]").value;
                    break;
            }
            if (!!n) { this.setCustomValidity(this.getAttribute("data-m")); }
            return;
        },
        getLabel = function (isv) {
            µ.alls("[type=button]").forEach(function () {
                this.value = this.getAttribute(isv ? "data-k" : "data-j");
            });
        },
        razError = function () {
            µ.one(".forget").toggle(false);
            µ.alls("[type=email], [type=password], [type=text]").toggleClass("e", false);
            µ.one(".g").html("");
            µ.one(".n").html("");
        },
        sendRequest = function (u, d, c) {
            var r = new XMLHttpRequest();
            r.open("POST", u, true);
            r.setRequestHeader("Content-Type", "application/json");
            r.onreadystatechange = function () {
                if (r.readyState !== 4 || r.status !== 200) return;
                c(JSON.parse(r.responseText));
                return false;
            };
            r.send(JSON.stringify(d));
        };

    µ.addEventListener("DOMContentLoaded", function (event) {
        "use strict";
        µ.one("section").toggle(true);
        µ.one("div").toggle(false);
        µ.alls("input").setEvents("input propertychange", checkValid);
        µ.one("#logForm").setEvents("submit", function (e) {
            e.preventDefault();
            razError();
            µ.one("div").toggle(true);
            sendRequest(µ.one("[data-h]").isVisible() ? "/new" : "/login", this.formToJson(), function (s) {
                if (!!s && !!s.success) { return window.location.reload(true); }
                µ.alls("[type=email], [type=password], [type=text]").toggleClass("e", true);
                µ.one("div").toggle(false);
                µ.one("[type=email]").focus();
                µ.one(".g").html(s.error);
                µ.one(".forget").toggle(true);
                return false;
            });
            return false;
        });
        µ.alls("[type=email],[type=password]").setEvents("change", razError);
        µ.alls("[type=button]").setEvents("click", function () {
            razError();
            var v = !µ.one("[data-h]").isVisible();
            getLabel(v);
            µ.alls("[data-h]").setValue("");
            if (!!v) { µ.alls("[data-h]").setAttributes({ "required": true }); } else { µ.alls("[data-h]").removeAttributes("required"); }
            µ.alls("[data-h]").fade();
            µ.one("[type=email]").focus();
        });
        µ.one("button.m").setEvents("click", function () {
            var that = this;
            razError();
            µ.one("div").toggle(true);
            sendRequest("/mail", µ.one("#logForm").formToJson(), function (s) {
                if (!!s.error) {
                    µ.one(".forget").toggle(true);
                    µ.alls("[type=email], [type=password], [type=text]").toggleClass("e", true);
                }
                µ.one(".g").html(s.error || "");
                µ.one(".n").html(s.success || "");
                µ.one("div").toggle(false);
                return false;
            });
        });
        µ.one("#f").setEvents("click", function () { window.location = "/gAuth"; });
    });
}