define("footer", [], function () {
    const toTop = () => {
        if (!µ.one("detail").visible) {
            const interval = setInterval(() => {
                const reduce = ((window.scrollY / 2) - 0.1).toFixed(1);
                window.scrollTo(0, reduce);
                if (reduce <= 0.1) {
                    window.scroll(0, 0);
                    clearInterval(interval);
                }
            }, 100);
        }
    };

    µ.one(window).observe("scroll", () => µ.one("#footer").toggleClass("notdisplayed", !window.scrollY));
    µ.one("#footer").observe("click", toTop);
    em.on("toTop", toTop);
});
