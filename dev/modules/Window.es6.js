define("Window", [], function () {
    const Window = function (selector, template = "") {
        if (!(this instanceof Window)) {
            return new Window(selector, template);
        }
        this.selector = selector;
        this.template = template;
        this.window = µ.one(selector).set("innerHTML", template);
        this.window.one(".closeWindow").observe("click", () => this.close());

        em.on("resize", this, this.closeAll);
        em.on("closeAll", this, this.closeAll);
        em.on("closeOver", this, this.closeOver);

        return this;
    };

    Window.prototype.close = function () {
        this.window.toggleClass("notdisplayed", true);
        µ.one(".waiting").toggleClass("notdisplayed", true);
        µ.one("html").toggleClass("overflown", false);
        em.emit(this, "close");
        return this;
    };

    Window.prototype.closeAll = function () {
        return this.close().closeOver();
    };

    Window.prototype.closeOver = function () {
        this.window.toggleClass("notdisplayed", true);
        µ.one(".waiting").toggleClass("over", false);
        em.emit(this, "closeOver");
        return this;
    };

    Window.prototype.many = function (selector) {
        return this.window.many(selector);
    };

    Window.prototype.one = function (selector) {
        return this.window.one(selector);
    };

    Window.prototype.open = function () {
        this.window.css({
            "top": `${µ.one("#navbar").visible ? µ.one("#navbar").get("clientHeight") : 10}px`
        });
        this.window.toggleClass("notdisplayed", false).one("[focus]").focus();
        µ.one(".waiting").toggleClass("notdisplayed", false);
        µ.one("html").toggleClass("overflown", true);
        em.emit(this, "open");
        return this;
    };

    Window.prototype.openOver = function () {
        this.window.toggleClass("notdisplayed", false).one("[focus]").focus();
        µ.one(".waiting").toggleClass("over", true);
        em.emit(this, "openOver");
        return this;
    };

    Window.prototype.set = function (...args) {
        this.window.set(...args);
        return this;
    };

    Window.prototype.toggle = function () {
        return this.window.hasClass("notdisplayed") ? this.open() : this.close();
    };

    return Window;
});
