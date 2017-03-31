define("Window", [], function () {
    const Window = function (selector, template) {
        if (!(this instanceof Window)) {
            return new Window(selector, template);
        }
        this.selector = selector;
        this.template = template;
        this.window = µ.one(selector).set("innerHTML", template);
        this.window.one(".closeWindow").observe("click", () => this.close());

        return this;
    };

    Window.prototype.one = function (selector) {
        return this.window.one(selector);
    };

    Window.prototype.many = function (selector) {
        return this.window.many(selector);
    };

    Window.prototype.open = function () {
        this.window.css({
            "top": `${document.body.scrollTop + µ.one("#navbar").get("clientHeight")}px`
        })
        this.window.toggleClass("notdisplayed", false);
        µ.one(".waiting").toggleClass("notdisplayed", false);
        µ.one("html").toggleClass("overflown", true);
        emitter.emit(this, "open");
    };

    Window.prototype.close = function () {
        this.window.toggleClass("notdisplayed", true);
        µ.one(".waiting").toggleClass("notdisplayed", true);
        µ.one("html").toggleClass("overflown", false);
        emitter.emit(this, "close");
    };

    Window.prototype.toggle = function () {
        if (this.window.hasClass("notdisplayed")) {
            this.open();
        } else {
            this.close();
        }
    };

    return Window;
});
