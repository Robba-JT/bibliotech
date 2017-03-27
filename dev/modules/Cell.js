define("Cell", ["lodash", "dom", "handlebars", "text!../templates/Cell"], function (_, µ, handlebars, template) {
    const render = handlebars.compile(template),
        Cell = function (book) {
            if (!(this instanceof Cell)) {
                return new Cell(book);
            }
            this.id = book.id;
            this.book = book;
            this.html = render(_.assign({}, book, {
                "source": _.get(book, "cover") ? `/cover/${book.id}` : "",
                "alt": _.get(book, "cover") ? "notdisplayed" : "",
                "acc": _.get(book, "access") === "SAMPLE" ? "" : "notdisplayed",
                "add": _.get(book, "inCollection") ? "notdisplayed" : "",
                "remove": _.get(book, "inCollection") ? "" : "notdisplayed"
            }));
            return this;
        };

    handlebars.registerHelper("cellWidth", function () {
        return `${~~(µ.one("bookcells").element.offsetWidth / ~~(µ.one("bookcells").element.offsetWidth / 257)) - 8}px`;
    });

    return Cell;
});
