define("context", [], (template) => {
    const Context = function () {
        this.context = µ.one("context").set("innerHTML", template);

        window.addEventListener("contextmenu", (event) => {
            event.preventDefault();
            this.open(event);
            return false;
        });

        window.addEventListener("click", (event) => {
            this.close();
            return true;
        });
    }

    Context.prototype.open = function (event) {
        this.context.toggleClass("notdisplayed", false);
        const thisHeight = this.context.get("clientHeight"),
            thisWidth = this.context.get("clientWidth"),
            eventX = event.clientX,
            eventY = event.clientY;
        this.context.css({
            "top": eventY + thisHeight > window.innerHeight ? eventY - thisHeight : eventY,
            "left": eventX + thisWidth > window.innerWidth ? eventX - thisWidth : eventX
        });
        return this;
    }

    Context.prototype.close = function () {
        this.context.toggleClass("notdisplayed", true);
        return this;
    }

    return new Context();
});
