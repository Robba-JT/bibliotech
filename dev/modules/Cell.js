define("Cell", ["lodash", "dom", "handlebars", "text!../templates/Cell"], function (_, µ, handlebars, template) {
    const render = handlebars.compile(template),
        Cell = function (book) {
            console.log(template);
            if (!(this instanceof Cell)) {
                return new Cell(book);
            }
            this.book = book;
            this.html = render(book);
            console.log(this.html);
            µ.one("bookcells").append("article", this.html);
            return this;
        };

    return Cell;
});
