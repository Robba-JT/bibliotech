define("footer", ["dom"], function (µ) {
    µ.one(window).observe("scroll", () => µ.one("#footer").toggleClass("notdisplayed", !document.body.scrollTop));

    µ.one("#footer").observe("click", () => {
        const toTop = setInterval(() => {
            const reduce = ((document.body.scrollTop / 2) - 0.1).toFixed(1);
            window.scroll(0, reduce);
            if (reduce <= 0.1) {
                window.scroll(0, 0);
                clearInterval(toTop);
            }
        }, 100);
    });
});
