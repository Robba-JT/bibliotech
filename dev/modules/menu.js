define("menu", ["Window", "text!../templates/menu", "text!../templates/contacts"], function (Window, tempMenu, tempContacts) {
    const navbar = µ.one("navbar").set("innerHTML", tempMenu).toggleClass("notdisplayed"),
        contacts = new Window("contacts", tempContacts);

    navbar.many("#affichToggle, #altNavbar").observe("click", () => {
        navbar.many(".navbar").toggleClass("notdisplayed");
        µ.one("bookcells").css("top", µ.one("#navbar").get("clientHeight") || 0);
    });
    navbar.one("#recherche").observe("click", () => emitter.emit("openSearch"));
    navbar.one("#profile").observe("click", () => emitter.emit("openProfile"));
    navbar.one("#collection").observe("click", () => emitter.emit("showCollection"));
    navbar.one("#contact").observe("click", () => contacts.open());

    µ.one("bookcells").css("top", µ.one("#navbar").get("clientHeight"));
    navbar.one("#logout").observe("click", () => {
        request("/logout").send().then(() => {
            window.location.reload("/");
        });
    });

    emitter.on("clickMenu", function (active) {
        if (_.isString(active)) {
            navbar.many(".active").toggleClass("active", false);
            navbar.one(`#${active}`).toggleClass("active", true);
        }
    });
});
