define("search", ["collection", "Window", "text!../templates/search"], function (collection, Window, template) {
    const Search = function () {
        this.last = {};
        this.window = new Window("search", template);

        em.on("openSearch", () => {
            this.window.one("form").reset();
            this.window.open();
        });
        em.on("filtreSearch", this, function () {
            _.forEach(this.last.cells, (cell) => cell.filter());
        });
        em.on("associated", (associated) => {
            em.emit("cellsReset");
            if (_.get(this.last, "qs.associated") !== associated) {
                this.last = {
                    "qs": {
                        associated
                    }
                };
                this.last.books = [];
                this.associated();
            } else {
                em.emit("cellsShow", this.last.cells);
            }
        });
        em.on("search", this, (qs) => {
            if (!_.isEqual(qs, this.last.qs)) {
                this.last.qs = qs;
                this.last.books = [];
                this.last.cells = [];
                em.emit("cellsReset");
                µ.many(".waiting, .roundIcon, .waitAnim").toggleClass("notdisplayed", false);
                µ.one("sort.active").toggleClass("active", false);
                em.emit("resetFilter");
                em.emit("clickMenu", "recherche");
                this.get(qs);
            } else {
                em.emit("cellsReset");
                em.emit("cellsShow", this.last.cells);
            }
        });

        µ.one("form[name=searchForm]").observe("submit", (event) => {
            event.preventDefault();
            const search = event.element.parser();
            if (!_.isEqual(search, this.last.qs)) {
                this.window.close();
                µ.many(".waiting, .roundIcon, .waitAnim").toggleClass("notdisplayed", false);
                µ.one("sort.active").toggleClass("active", false);
                this.last.qs = search;
                this.last.books = [];
                this.last.cells = [];
                em.emit("cellsReset");
                this.get(search);
                event.element.reset();
                em.emit("resetFilter");
                em.emit("clickMenu", "recherche");
            }
            return false;
        });
    };

    Search.prototype.associated = function () {
        µ.many(".waiting, .roundIcon, .waitAnim").toggleClass("notdisplayed", false);
        µ.one("sort.active").toggleClass("active", false);
        em.emit("resetFilter");
        em.emit("clickMenu", "recherche");
        const storeBooks = store.get(this.last.qs);
        if (storeBooks) {
            this.show(storeBooks);
            µ.one(".waitAnim").toggleClass("notdisplayed", true);
        } else {
            req(`/associated/${this.last.qs.associated}`).send().then((result) => {
                this.show(result.books);
                µ.one(".waitAnim").toggleClass("notdisplayed", true);
                store.set(this.last.qs, result.books);
            }).catch((error) => err.add(error));
        }
        return this;
    };

    Search.prototype.get = function () {
        const storeBooks = store.get(this.last.qs);
        if (storeBooks) {
            this.show(storeBooks);
            µ.one(".waitAnim").toggleClass("notdisplayed", true);
        } else {
            this.request();
        }
        return this;
    };

    Search.prototype.recommanded = function () {
        this.window.close();
        if (!_.isEqual("recommanded", this.last.qs)) {
            this.last.qs = "recommanded";
            const storeBooks = store.get(this.last.qs);
            if (storeBooks) {
                this.show(storeBooks);
                µ.one(".waitAnim").toggleClass("notdisplayed", true);
            } else {
                req("recommanded", "POST").send().then((result) => {
                    this.show(result);
                    store.set(this.last.qs, result);
                }).catch((error) => {
                    err.add(error);
                });
            }
        } else {
            em.emit("cellsReset");
            em.emit("cellsShow", this.last.cells);
        }
        return this;
    };

    Search.prototype.request = function () {
        req("search").send(_.merge({}, this.last.qs, {
            "index": this.last.books.length
        })).then((result) => {
            this.show(result.books);
            if (result.books.length === 40 && this.last.books.length < 400) {
                this.request();
            } else {
                µ.one(".waitAnim").toggleClass("notdisplayed", true);
                store.set(this.last.qs, this.last.books);
            }
            return false;
        }).catch((error) => {
            err.add(error);
        });
    };

    Search.prototype.show = function (books) {
        this.last.books = _.unionBy(this.last.books, books, "id");
        const newCells = _.map(books, (book) => {
            return em.emit("getCell", book);
        });
        this.last.cells = _.unionBy(this.last.cells, newCells, "id");
        µ.many(".waiting, .roundIcon").toggleClass("notdisplayed", true);
        em.emit("cellsShow", newCells);
        return this;
    };

    return new Search();
});
