if (!window.FileReader || !window.Promise || !("formNoValidate" in document.createElement("input"))) {
    document.one("div").toggleClass("notdisplayed");
    alert("Votre navigateur n'est pas compatible!!!");
} else {
    var µ = document,
        checkValid = function () {
            var n;
            this.setCustomValidity("");
            switch (this.name) {
                case "b":
                    n = this.isVisible() && this.value.length < 4;
                    break;
                case "c":
                    n = this.value.length < 4 || this.value.length > 12;
                    break;
                case "d":
                    n = this.isVisible() && this.value !== µ.one("[name=c]").value;
                    break;
            }
            if (!!n) { this.setCustomValidity(this.getAttribute("m")); }
            return;
        },
        getLabel = function (isv) {
            µ.alls("[type=button]").forEach(function () {
                this.value = this.getAttribute(isv ? "k" : "j");
            });
        },
        googleApi = function () {
            gapi.load("auth2", function() {
                auth2 = gapi.auth2.init({
                    "client_id": "216469168993-dqhiqllodmfovgtrmjdf2ps5kj0h1gg9.apps.googleusercontent.com",
                    "scope": "https://www.googleapis.com/auth/books",
                    "access_type": "online"
                });
                µ.one("#f").setEvents("click", function () {
                    auth2.grantOfflineAccess({ "redirect_uri": "postmessage"}).then(function (response) {
                        if (!response.code) { return; }
                        sendRequest("/googleAuth", { c: response.code }, function (s) {
                            if (!!s && !!s.success) { return window.location.reload(true); }
                            return false;
                        });
                    });
                });
            });
        },
        razError = function () {
            µ.alls(".g, .m").toggle(false);
            µ.one(".g").html("");
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

    (function() {
        var po = µ.createElement("script");
        po.type = "text/javascript";
        po.async = true;
        //po.src = "https://apis.google.com/js/client:plusone.js?onload=googleApi";
        po.src = "https://apis.google.com/js/client:platform.js?onload=googleApi";
        var s = µ.one("script");
        s.parentNode.insertBefore(po, s);
    })();

    µ.addEventListener("DOMContentLoaded", function (event) {
        "use strict";
        µ.one("section").toggle(true);
        µ.one("div").toggle(false);
        µ.alls("input").setEvents("input propertychange", checkValid);
        µ.one("form").setEvents("submit", function (e) {
            e.preventDefault();
            razError();
            µ.one("div").fade(0.5);
            sendRequest(µ.one("[h]").isVisible() ? "/new" : "/login", this.formToJson(), function (s) {
                if (!!s && !!s.success) { return window.location.reload(true); }
                µ.alls("[type=email], [type=password], [type=text]").toggleClass("e", true);
                µ.one("div").fade(false);
                µ.one("[type=email]").focus();
                µ.one(".g").html(s.error);
                µ.alls(".g, .m").fade(true);
                return false;
            });
            return false;
        });
        µ.alls("[type=email],[type=password]").setEvents("change", razError);
        µ.alls("[type=button]").setEvents("click", function () {
            razError();
            var v = !µ.one("[h]").isVisible();
            getLabel(v);
            µ.alls("[h]").setValue("");
            if (!!v) {
                µ.alls("[h]").setAttributes({ "required": true });
            } else {
                µ.alls("[h]").removeAttributes("required");
            }
            µ.alls("[h]").fade();
            µ.one("[type=email]").focus();
        });
        µ.one(".m").setEvents("click", function () {
            var that = this;
            that.setAttribute("disabled", true);
            that.classList.add("l");
            sendRequest("/mail", µ.one("form").formToJson(), function (s) {
                that.classList.remove("l");
                return false;
            });
        });
    });
}
