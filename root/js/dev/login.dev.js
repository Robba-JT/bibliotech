Element.prototype.isv = function () { return this.offsetWidth > 0 && this.offsetHeight > 0; };
Element.prototype.serialize = function () {
    var s = {};
    [].forEach.call(this.getElementsByTagName("input"), function(elt) { if (!!elt.name && !!elt.value) { s[elt.name] = elt.value; }});
    return s;
};
Object.prototype.l = function (attribut) {
    [].forEach.call(this, function (elt) { elt.value = elt.getAttribute(!!attribut ? "k" : "j"); });
    return this;
};
Object.prototype.fade = function (display, callback) {
    var p = [];
    if (typeof display === "function" && !callback) { callback = display; display = undefined; }
    [].forEach.call(this, function (elt) {
        var eltd = typeof display === "undefined" ? !elt.isv() : display, op = elt.style.opacity;
        p.push(new Promise(function (resolve) {
            if (!!eltd) { elt.style.display = "block"; op = 0; }
            var timer = setInterval(function () {
                if (!!eltd) {
                    if (op >= (eltd || 1)) { clearInterval(timer); resolve(elt); } else { elt.style.opacity = (op += 0.1).toFixed(1); }
                } else {
                    if (op <= 0) { clearInterval(timer); elt.style.display = "none"; resolve(elt); } else { elt.style.opacity = (op -= 0.1).toFixed(1); }
                }
            }, 10);
        }));
    });
    Promise.all(p).then(callback);
    return this;
};

var gp = function () {
        gapi.signin.render("f", {
            clientid: "216469168993-dqhiqllodmfovgtrmjdf2ps5kj0h1gg9.apps.googleusercontent.com",
            cookiepolicy: "none",
            scope: "https://www.googleapis.com/auth/plus.me https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/books",
            width: "wide",
            redirecturi: "postmessage",
            accesstype: "offline",
            callback: function (response) {
                console.debug("google response", response);
                if (!response.code) { return; }
                sr("/googleAuth", { c: response.code }, function (s) {
                    if (!!s && !!s.success) { return window.location.reload(true); }
                    return false;
                });
            }
        });
    },
    ebc = function (c, e, f) { [].forEach.call(document.querySelectorAll(c), function (el) { el.addEventListener(e, f, false); }); },
    sr = function (u, d, c) {
        var r = new XMLHttpRequest();
        r.open("POST", u, true);
        r.setRequestHeader("Content-Type", "application/json");
        r.onreadystatechange = function () {
            if (r.readyState !== 4 || r.status !== 200) return;
            c(JSON.parse(r.responseText));
            return false;
        };
        r.send(JSON.stringify(d));
    },
    razError = function () {
        document.querySelectorAll(".g, .m").fade(false);
        document.querySelector(".g").innerHTML = "";
    };

(function() {
    var po = document.createElement("script");
    po.type = "text/javascript";
    po.async = true;
    po.src = "https://apis.google.com/js/client:plusone.js?onload=gp";
    var s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(po, s);
})();

document.addEventListener("DOMContentLoaded", function () {
    "use strict";
    if (!window.FileReader || !window.Promise || !("formNoValidate" in document.createElement("input"))) {
        alert("Votre navigateur n'est pas compatible!!!");
        return false;
    }
    document.getElementsByTagName("section")[0].style.display = "block";
    document.getElementsByTagName("div")[0].style.display = "none";

    ebc("[type=text], [type=password]", "input propertychange", function () {
        var n;
        this.setCustomValidity("");
        switch (this.name) {
            case "b":
                n = (this.value.length < 4);
                break;
            case "c":
                n = (this.value.length < 4 || this.value.length > 12);
                break;
            case "d":
                n = (this.value !== document.querySelector("[name=c]").value);
                break;
        }
        if (!!n) { this.setCustomValidity(this.getAttribute("m")); }
        return;
    });
    ebc("form", "submit", function (e) {
        e.preventDefault();
        razError();
        document.getElementsByTagName("div").fade(0.5);
        sr(document.querySelector("[h]").isv() ? "/new" : "/login", this.serialize(), function (s) {
            console.debug("response", response);
            if (!!s && !!s.success) { return window.location.reload(true); }
            [].forEach.call(document.querySelectorAll("[type=email], [type=password], [type=text]"), function (el) { el.classList.add("e"); });
            document.getElementsByTagName("div").fade(false);
            document.querySelector("[name=a]").focus();
            document.querySelector(".g").innerHTML = s.error;
            document.querySelectorAll(".g, .m").fade(true);
            return false;
        });
        return false;
	});
    ebc("[type=email],[type=password]", "change", razError);
    ebc("[type=button]", "click", function () {
        razError();
        var v = !document.querySelector("[h]").isv();
        document.querySelectorAll("[j]").l(v);
        document.querySelectorAll("[h]").fade(function (elts) {
            for (var i = 0, lg = elts.length; i < lg; i++) {
                elts[i].setAttribute("required", v);
                elts[i].value = "";
            }
        });
        document.querySelector("[type=email]").focus();
    });
    ebc(".m", "click", function () {
        var that = this;
        that.setAttribute("disabled", true);
        that.classList.add("l");
        sr("/mail", document.querySelector("form").serialize(), function (s) {
            that.classList.remove("l");
            return false;
        });
    });
});
