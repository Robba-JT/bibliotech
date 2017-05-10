"use strict";

define("context", [], function (template) {
    var Context = function Context() {
        var _this = this;

        this.context = µ.one("context").set("innerHTML", template);

        window.addEventListener("contextmenu", function (event) {
            event.preventDefault();
            _this.open(event);
            return false;
        });

        window.addEventListener("click", function (event) {
            _this.close();
            return true;
        });
    };

    Context.prototype.close = function () {
        this.context.toggleClass("notdisplayed", true);
        return this;
    };

    Context.prototype.open = function (event) {
        this.context.toggleClass("notdisplayed", false);
        var thisHeight = this.context.get("clientHeight"),
            thisWidth = this.context.get("clientWidth"),
            eventX = event.clientX,
            eventY = event.clientY;
        this.context.css({
            "top": eventY + thisHeight > window.innerHeight ? eventY - thisHeight : eventY,
            "left": eventX + thisWidth > window.innerWidth ? eventX - thisWidth : eventX
        });
        return this;
    };

    return new Context();
});
