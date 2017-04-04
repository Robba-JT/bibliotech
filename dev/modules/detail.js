define("detail", ["Window", "hdb", "text!../templates/detail"], function (Window, hdb, template) {
    const render = hdb.compile(template),
        detail = µ.one("detail"),
        Detail = function () {
            em.on("openDetail", this, (book) => {
                this.open(book);
            });
        };

    Detail.prototype.open = function (book) {
        µ.one(".waiting").toggleClass("notdisplayed", false);
        µ.one("html").toggleClass("overflown", true);
        this.init(book);
    };

    Detail.prototype.close = function () {
        detail.toggleClass("notdisplayed", true);
        µ.one(".waiting").toggleClass("notdisplayed", true);
        µ.one("html").toggleClass("overflown", false);
    };

    Detail.prototype.init = function (book) {
        console.log("init", book);
        detail.set("innerHTML", render(_.assign(book, {
            "source": _.get(book, "cover") ? `/cover/${book.id}` : "",
            "alt": _.get(book, "cover") ? " notdisplayed" : "",
            "authors": book.authors.split(",")
        })));
        detail.one(".closeWindow").observe("click", () => {
            this.close();
        });
        detail.css({
            "top": `${document.body.scrollTop}px`
        }).toggleClass("notdisplayed", false);
    };

    return new Detail();
});
