define("menu", ["Window", "text!../templates/menu", "text!../templates/contacts", "text!../templates/help", "text!../templates/sorts"], function (Window, tempMenu, tempContacts, tempHelp, tempSorts) {
    const navbar = µ.one("navbar").set("innerHTML", tempMenu).toggleClass("notdisplayed"),
        sorts = µ.one("sorts").set("innerHTML", tempSorts),
        contacts = new Window("contacts", tempContacts).set("id", "contactsWindow"),
        help = new Window("help", tempHelp);

    let last = "";

    navbar.many("#affichToggle, #altNavbar").observe("click", () => {
        navbar.many(".navbar").toggleClass("notdisplayed");
        µ.one("bookcells").css("top", µ.one("#navbar").get("clientHeight") || 0);
    });
    navbar.one("#recherche").observe("click", () => em.emit("openSearch"));
    navbar.one("#profile").observe("click", () => em.emit("openProfile"));
    navbar.one("#collection").observe("click", () => em.emit("showCollection"));
    navbar.one("#contact").observe("click", () => contacts.open());
    navbar.one("#tags").observe("click", () => em.emit("openCloud"));

    µ.one("bookcells").css("top", µ.one("#navbar").get("clientHeight"));
    navbar.one("#logout").observe("click", () => {
        req("/logout").send().then(() => {
            window.location.reload("/");
        });
    });

    navbar.one("form").observe("submit", function (event) {
        event.preventDefault();
        return false;
    });

    navbar.one("[type=search]").observe("search", function (event) {
        event.preventDefault();
        const filtre = this.value;
        if (this.valid && filtre !== last) {
            em.emit(navbar.one("#collection").hasClass("active") ? "filtreCollection" : "filtreSearch", filtre);
            last = filtre;
            navbar.one("#selectedSearch span").text = last;
            navbar.one("#selectedSearch").toggleClass("notdisplayed", !last);
        }
        return false;
    });

    em.on("clickMenu", function (active) {
        if (_.isString(active)) {
            navbar.many(".active").toggleClass("active", false);
            navbar.one(`#${active}`).toggleClass("active", true);
        }
    });

    em.on("resetFilter", function (withTags) {
        navbar.one("#selectedTag span").text = navbar.one("#selectedSearch span").text = "";
        navbar.many("#selectedTag, #selectedSearch").toggleClass("notdisplayed", true);
        navbar.one("#tags").toggleClass("notdisplayed", !withTags);
        navbar.one("form").reset();
    });

    contacts.many("[url]").observe("click", (event) => window.open(event.element.get("url")));
    contacts.one("#helpLink").observe("click", (event) => {
        contacts.close();
        help.open();
    });
    contacts.one("#mailLink").observe("click", (event) => {
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
});
