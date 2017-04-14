define("Window", [], function () {
    const Window = function (selector, template = "") {
        if (!(this instanceof Window)) {
            return new Window(selector, template);
        }
        this.selector = selector;
        this.template = template;
        this.window = µ.one(selector).set("innerHTML", template);
        this.window.one(".closeWindow").observe("click", () => this.close());

        em.on("resize", this, this.close);
        em.on("closeAll", this, this.close);

        return this;
    };

    Window.prototype.one = function (selector) {
        return this.window.one(selector);
    };

    Window.prototype.many = function (selector) {
        return this.window.many(selector);
    };

    Window.prototype.set = function (...args) {
        this.window.set(...args);
        return this;
    }

    Window.prototype.open = function () {
        this.window.css({
            "top": `${document.body.scrollTop + µ.one("#navbar").get("clientHeight")}px`
        });
        this.window.toggleClass("notdisplayed", false).one("[focus]").focus();
        µ.one(".waiting").toggleClass("notdisplayed", false);
        µ.one("html").toggleClass("overflown", true);
        em.emit(this, "open");
        return this;
    };

    Window.prototype.close = function () {
        this.window.toggleClass("notdisplayed", true);
        µ.one(".waiting").toggleClass("notdisplayed", true);
        µ.one("html").toggleClass("overflown", false);
        em.emit(this, "close");
        return this;
    };

    Window.prototype.toggle = function () {
        if (this.window.hasClass("notdisplayed")) {
            this.open();
        } else {
            this.close();
        }
        return this;
    };

    return Window;
});
