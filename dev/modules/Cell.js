define("Cell", ["lodash", "dom", "handlebars", "text!../templates/Cell"], function (_, µ, handlebars, template) {
    const render = handlebars.compile(template),
        Cell = function (book) {
            if (!(this instanceof Cell)) {
                return new Cell(book);
            }
            this.id = book.id;
            this.book = book;
            this.html = render(book);
            return this;
        };

    return Cell;
});
