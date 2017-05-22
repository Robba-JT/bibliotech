define("footer", [], function () {
    const toTop = (event) => {
        if (!µ.one("detail").visible) {
            const interval = setInterval(() => {
                const reduce = ((document.body.scrollTop / 2) - 0.1).toFixed(1);
                window.scrollTo(0, reduce);
                if (reduce <= 0.1) {
                    window.scroll(0, 0);
                    clearInterval(interval);
                }
            }, 100);
        }
    };

    µ.one(window).observe("scroll", () => µ.one("#footer").toggleClass("notdisplayed", !document.body.scrollTop));
    µ.one("#footer").observe("click", toTop);
    em.on("toTop", toTop);
});
