define("search", ["cells", "collection", "Window", "text!../templates/search"], function (cells, collection, Window, template) {
    const Search = function () {
        this.last = {};
        this.window = new Window("search", template);

        em.on("openSearch", () => {
            this.window.one("form").reset();
            this.window.open();
        });
        em.on("filtreSearch", this, function (filtre) {
            _.forEach(this.last.books, (cell) => cell.filter(filtre));
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
                em.emit("clickMenu", "recherche");
            }
            return false;
        });
    };

    Search.prototype.show = function (books) {
        µ.many(".waiting, .roundIcon").toggleClass("notdisplayed", true);
        const newBooks = _.map(books, (book) => {
            return collection.get(book.id) || cells.getCell(book);
        });
        this.last.books = _.unionBy(this.last.books, newBooks, "id");
        cells.show(newBooks);
    };

    Search.prototype.get = function () {
        req("/search", "POST").send(_.merge(this.last.qs, {
            "index": this.last.books.length
        })).then((result) => {
            this.show(result.books);
            if (result.books.length === 40) {
                //return this.get();
            }
            return false;
        }).catch(err.add);
    };

    Search.prototype.recommanded = function () {
        this.window.close();
        if (!_.isEqual("recommanded", this.last.qs)) {
            this.last.qs = "recommanded";
            req("/recommanded", "POST").send().then(this.show).catch(err.add);
        }
    };

    return new Search();
});
