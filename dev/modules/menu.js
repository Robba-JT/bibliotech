"use strict";

define("menu", ["Window", "text!../templates/menu", "text!../templates/contacts", "text!../templates/help", "text!../templates/sorts"], function (Window, tempMenu, tempContacts, tempHelp, tempSorts) {
    var navbar = µ.one("navbar").set("innerHTML", tempMenu).toggleClass("notdisplayed"),
        sorts = µ.one("sorts").set("innerHTML", tempSorts),
        contacts = new Window("contacts", tempContacts).set("id", "contactsWindow"),
        help = new Window("help", tempHelp),
        toggleMenu = function toggleMenu() {
        navbar.many(".navbar").toggleClass("notdisplayed");
        µ.one("bookcells").css("top", µ.one("#navbar").get("clientHeight") || 0);
    };

    var last = "";

    navbar.many("#affichToggle, #altNavbar").observe("click", toggleMenu);
    navbar.one("#recherche").observe("click", function () {
        return em.emit("openSearch");
    });
    navbar.one("#profile").observe("click", function () {
        return em.emit("openProfile");
    });
    navbar.one("#collection").observe("click", function () {
        return em.emit("showCollection");
    });
    navbar.one("#contact").observe("click", function () {
        return contacts.open();
    });
    navbar.one("#tags").observe("click", function () {
        return em.emit("openCloud");
    });
    navbar.one("#saveorder").observe("click", function () {
        return em.emit("saveOrder");
    });

    µ.one("bookcells").css("top", µ.one("#navbar").get("clientHeight"));
    navbar.one("#logout").observe("click", function () {
        em.emit("logout");
    });

    navbar.one("form").observe("submit", function (event) {
        event.preventDefault();
        return false;
    });

    navbar.one("[type=search]").observe("search", function (event) {
        event.preventDefault();
        var filtre = this.value;
        if (this.valid && filtre !== last) {
            last = filtre;
            navbar.one("#selectedSearch span").text = last;
            navbar.one("#selectedSearch").toggleClass("notdisplayed", !last);
            em.emit(navbar.one("#collection").hasClass("active") ? "filtreCollection" : "filtreSearch");
        }
        return false;
    });

    em.on("clickMenu", function (active) {
        if (_.isString(active)) {
            navbar.many(".active").toggleClass("active", false);
            navbar.one("#" + active).toggleClass("active", true);
            µ.one("#saveorder").toggleClass("notdisplayed", true);
        }
    });

    em.on("resetFilter", function (withTags) {
        navbar.one("#selectedTag span").text = navbar.one("#selectedSearch span").text = "";
        navbar.many("#selectedTag, #selectedSearch").toggleClass("notdisplayed", true);
        navbar.one("#tags").toggleClass("notdisplayed", !withTags);
        navbar.one("form").reset();
    });

    em.on("logout", function () {
        store.clear();
        req("/logout").send().then(function () {
            window.location.reload("/");
        });
    });

    contacts.many("[url]").observe("click", function (event) {
        return window.open(event.element.get("url"));
    });
    contacts.one("#helpLink").observe("click", function (event) {
        contacts.close();
        help.open();
    });
    contacts.one("#mailLink").observe("click", function (event) {
        event.element.one("a").trigger("click");
    });

    navbar.one("#tris").observe("click", function (event) {
        sorts.css({
            "top": µ.one("#navbar").get("clientHeight"),
            "left": this.element.offsetLeft
        }).toggleClass("notdisplayed");
    });
    sorts.many("div").observe("click", function () {
        navbar.one("#tris").trigger("click");
        if (navbar.one("#collection").hasClass("active")) {
            em.emit("sortCollection", {
                "by": this.get("by"),
                "sort": this.get("sort")
            });
        }
        sorts.many("div").toggleClass("sortBy", false);
        this.toggleClass("sortBy", true);
    });

    window.addEventListener("selectstart", function (event) {
        return !_.includes(["INPUT", "TEXTAREA"], _.toUpper(event.target.tagName)) ? event.preventDefault() && false : true;
    });
    window.addEventListener("keyup", function (event) {
        var test = false;
        if (!event.ctrlKey) {
            if (event.altKey) {
                if (_.includes([66, 69, 72, 73, 76, 77, 80, 82, 84], event.keyCode) && µ.one(".waitAnim").visible) {
                    test = true;
                } else {
                    switch (event.keyCode) {
                        case 66:
                            em.emit("showCollection");
                            test = true;
                            break;
                        case 69:
                            em.emit("openCloud");
                            test = true;
                            break;
                        case 72:
                            help.open();
                            test = true;
                            break;
                        case 73:
                            contacts.open();
                            test = true;
                            break;
                        case 76:
                            em.emit("logout");
                            break;
                        case 77:
                            toggleMenu();
                            test = true;
                            break;
                        case 80:
                            em.emit("openProfile");
                            test = true;
                            break;
                        case 82:
                            em.emit("openSearch");
                            test = true;
                            break;
                        case 84:
                            em.emit("toTop");
                            test = true;
                        default:
                    }
                }
            } else {
                if (event.keyCode === 27) {
                    em.emit(µ.one(".over").visible ? "closeOver" : "closeAll");
                    test = true;
                } else if (event.keyCode === 8 && !_.includes(["INPUT", "TEXTAREA"], _.toUpper(event.target.tagName))) {
                    test = true;
                } else if (µ.one("detail").visible && _.includes([37, 38, 39, 40], event.keyCode)) {
                    var context = µ.one("context");
                    var nav = "";
                    switch (event.keyCode) {
                        case 37:
                            nav = "left";
                            break;
                        case 38:
                            nav = "top";
                            break;
                        case 39:
                            nav = "right";
                            break;
                        case 40:
                            nav = "bottom";
                            break;
                        default:
                    }
                    context.one("[nav=" + nav + "]").trigger("click");
                }
            }
        }
        if (test) {
            event.preventDefault();
        }
        return !test;
    });
    window.addEventListener("contextmenu", function (event) {
        event.preventDefault();
        return false;
    });
});
