define("search", ["cells", "Window", "text!../templates/search"], function (cells, Window, template) {
    const Search = function () {
        this.last = {};
        this.window = new Window("search", template);

        emitter.on("openSearch", () => {
            this.window.one("form").reset();
            this.window.open();
        });

        µ.one("form[name=searchForm]").observe("submit", (event) => {
            event.preventDefault();
            const search = event.element.parser();
            if (!_.isEqual(search, this.last.qs)) {
                this.last.qs = search;
                this.last.books = [];
                this.window.close();
                cells.reset();
                this.get(search);
                event.element.reset();
                µ.many(".waiting, .roundIcon").toggleClass("notdisplayed", false);
                emitter.emit("clickMenu", "recherche");
            }
            return false;
        });
    };

    Search.prototype.show = function (books) {
        µ.many(".waiting, .roundIcon").toggleClass("notdisplayed", true);
        const newBooks = _.map(books, (book) => cells.getCell(book));
        this.last.books = _.unionBy(this.last.books, newBooks, "id");
        cells.showAll(newBooks);
    };

    Search.prototype.error = function (error) {
        console.error(error);
    };

    Search.prototype.get = function () {
        request("/search", "POST").send(_.merge(this.last.qs, {
            "index": this.last.books.length
        })).then((result) => {
            this.show(result.books);
            if (result.books.length === 40) {
                //return this.get();
            }
            return false;
        }).catch(this.error);
    };

    Search.prototype.recommanded = function () {
        this.window.close();
        if (!_.isEqual("recommanded", this.last.qs)) {
            this.last.qs = "recommanded";
            request("/recommanded", "POST").send().then(this.show).catch(this.error);
        }
    };

    return new Search();
});
