define("menu", ["Window", "text!../templates/menu", "text!../templates/contacts", "text!../templates/help", "text!../templates/sorts"], function (Window, tempMenu, tempContacts, tempHelp, tempSorts) {
    const navbar = µ.one("navbar").set("innerHTML", tempMenu).toggleClass("notdisplayed"),
        sorts = µ.one("sorts").set("innerHTML", tempSorts),
        contacts = new Window("contacts", tempContacts).set("id", "contactsWindow"),
        help = new Window("help", tempHelp),
        toggleMenu = () => {
            navbar.many(".navbar").toggleClass("notdisplayed");
            µ.one("bookcells").css("top", µ.one("#navbar").get("clientHeight") || 0);
        };

    var last = "";

    µ.one("bookcells").css("top", µ.one("#navbar").get("clientHeight"));

    //Hide
    navbar.hide = function () {
        navbar.one("#navbar").toggleClass("transparent", true);
        µ.one("bookcells").css("top", 0);
        sorts.toggleClass("notdisplayed", true);
    };

    //Timeout
    navbar.timeout = setTimeout(navbar.hide, 5000);

    //Toggle
    navbar.many("#affichToggle, #altNavbar").observe("click", toggleMenu);

    //Logout
    em.on("logout", () => {
        store.clear();
        req("/logout").send().then(() => {
            window.location.reload("/");
        });
    });
    navbar.one("#logout").observe("click", () => {
        em.emit("logout");
    });

    //Actions
    navbar.one("#recherche").observe("click", () => em.emit("openSearch"));
    navbar.one("#profile").observe("click", () => em.emit("openProfile"));
    navbar.one("#collection").observe("click", () => {
        em.emit("defaultSort");
        em.emit("showCollection");
    });
    navbar.one("#tags").observe("click", () => em.emit("openCloud"));
    navbar.one("#saveorder").observe("click", () => em.emit("saveOrder"));
    navbar.one("#newbook").observe("click", () => em.emit("newBook"));
    em.on("clickMenu", function (active) {
        if (_.isString(active)) {
            navbar.many(".active").toggleClass("active", false);
            navbar.one(`#${active}`).toggleClass("active", true);
            µ.one("#saveorder").toggleClass("notdisplayed", true);
            last = "";
        }
    });

    //Filter
    navbar.one("form").observe("submit", (event) => event.preventDefault());
    navbar.one("[type=search]").observe("search", function (event) {
        event.preventDefault();
        const filtre = this.value;
        if (this.valid && filtre !== last) {
            last = filtre;
            navbar.one("#selectedSearch span").text = last;
            navbar.one("#selectedSearch").toggleClass("notdisplayed", !last);
            em.emit(navbar.one("#collection").hasClass("active") ? "filtreCollection" : "filtreSearch");
        }
        return false;
    });
    em.on("resetFilter", function (withTags) {
        navbar.one("#selectedTag span").text = navbar.one("#selectedSearch span").text = "";
        navbar.many("#selectedTag, #selectedSearch").toggleClass("notdisplayed", true);
        navbar.one("#tags").toggleClass("notdisplayed", !withTags);
        navbar.one("form").reset();
    });

    //Contact
    navbar.one("#contact").observe("click", () => contacts.open());
    contacts.many("[url]").observe("click", (event) => window.open(event.element.get("url")));
    contacts.one("#helpLink").observe("click", (event) => {
        contacts.close();
        help.open();
    });
    contacts.one("#mailLink").observe("click", (event) => event.element.one("a").trigger("click"));

    //Sorts
    navbar.one("#tris").observe("click", function (event) {
        sorts.css({
            "top": µ.one("#navbar").get("clientHeight"),
            "left": this.element.offsetLeft
        }).toggleClass("notdisplayed");
    }).observe("mouseover", () => sorts.toggleClass("onTris", true)).observe("mouseleave", () => sorts.toggleClass("onTris", false));
    sorts.many("div").observe("click", function () {
        navbar.one("#tris").trigger("click");
        em.emit("cellsSort", this.get("by"), this.get("sort"));
        sorts.many("div").toggleClass("sortBy", false);
        this.toggleClass("sortBy", true);
    });
    em.on("resetSort", () => sorts.one(".sortBy").toggleClass("sortBy", false));
    em.on("defaultSort", () => {
        sorts.one(".sortBy").toggleClass("sortBy", false);
        sorts.many("div").get(0).toggleClass("sortBy", true);
    });
    sorts.observe("mouseover", () => {
        if (sorts.timeout) {
            clearTimeout(sorts.timeout);
        }
    }).observe("mouseleave", () => {
        sorts.timeout = setTimeout(() => {
            sorts.toggleClass("notdisplayed", true);
        }, 1000);
    });

    //Window
    window.addEventListener("selectstart", (event) => {
        return !_.includes(["INPUT", "TEXTAREA"], _.toUpper(event.target.tagName)) ? event.preventDefault() && false : true;
    });
    window.addEventListener("keyup", (event) => {
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
                    const context = µ.one("context");
                    let nav = "";
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
                    context.one(`[nav=${nav}]`).trigger("click");
                }
            }
        }
        if (test) {
            event.preventDefault();
        }
        return !test;
    });

    navbar.observe("mouseover", (event) => {
        if (_.has(navbar, "timeout")) {
            clearTimeout(navbar.timeout);
        }
        const navbarDiv = event.element.one("#navbar");
        navbarDiv.toggleClass("transparent", false);
        µ.one("bookcells").css("top", navbarDiv.get("clientHeight"));
    }).observe("mouseleave", (event) => {
        navbar.timeout = setTimeout(navbar.hide, 2500);
    });

    window.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        return false;
    });
    window.addEventListener("click", (event) => {
        if (event.target.id !== "tris") {
            setTimeout(() => sorts.toggleClass("notdisplayed", true));
        }
    });
});
