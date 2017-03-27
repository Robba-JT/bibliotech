define("search", ["lodash", "dom", "Request", "Cell", "collection", "text!../templates/search"], function (_, µ, request, Cell, collection, template) {
    const Search = function () {
            this.search = "";
            this.books = [];
            this.window = Window(template, this);
        },
        Window = function (temp, parent) {
            const window = µ.one("search").set("innerHTML", template);

            window.one("form").observe("submit", (event) => {
                event.preventDefault();
                parent.get(event.element.parser());
                event.element.reset();
                return false;
            });

            window.one(".closeWindow")
                .observe("click", () => window.toggleClass("notdisplayed").one("[type=search]").set("value", ""));

            window.one("#recommand4u input").observe("click", () => parent.recommanded());

            return window;
        };

    Search.prototype.show = function (books) {
        this.window.toggleClass("notdisplayed", true);
        µ.many(".waiting, .roundIcon").toggleClass("notdisplayed", true);
        const bookcells = µ.one("bookcells");
        bookcells.html = "";
        this.books = [];
        _.forEach(books, (book) => {
            const cell = collection.has(book.id) ? collection.get(book.id) : new Cell(book);
            this.books.push(cell);
            bookcells.html += cell.html;
        });
    };

    Search.prototype.error = function (error) {
        console.error(error);
    };

    Search.prototype.get = function (search) {
        if (!_.isEqual(search, this.search)) {
            this.search = search;
            µ.many(".waiting, .roundIcon").toggleClass("notdisplayed", false);
            request("/search", "POST").send(this.search).then((result) => this.show(result)).catch(this.error);
        }
    };

    Search.prototype.open = function () {
        this.window.toggleClass("notdisplayed", false);
    };

    Search.prototype.recommanded = function () {
        this.window.toggleClass("notdisplayed", false);
        if (!_.isEqual("recommanded", this.search)) {
            this.search = "recommanded";
            request("/recommanded", "POST").send().then(this.show).catch(this.error);
        }
    };

    return new Search();
});
