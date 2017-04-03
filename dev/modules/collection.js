define("collection", ["cells"], function (cells) {
    const Collection = function () {
        em.once("initCollect", this, this.init);
        em.on("showCollection", this, this.show);
        em.on("addBook", this, function (bookId) {
            if (!this.has(bookId)) {
                req(`/book/${bookId}`, "POST").send().then((result) => {
                    this.cells.push(cells.getCell(result, true));
                    this.cells = _.sortBy(this.cells, ["book.title"]);
                    µ.one("#nbBooks").text = this.cells.length;
                }).catch(err.add);
            }
        });
        em.on("removeBook", this, function (bookId) {
            if (this.has(bookId)) {
                req(`/book/${bookId}`, "DELETE").send().then(() => {
                    _.remove(this.cells, ["id", bookId]);
                    µ.one("#nbBooks").text = this.cells.length;
                }).catch(err.add);
            }
        });
        em.on("filtreCollection", this, function (filtre) {
            _.forEach(this.cells, (cell) => cell.filter(filtre));
        });
        em.on("sortCollection", this, function (params) {
            cells.show(_.orderBy(this.cells, `book.${params.by}`, params.sort || "asc"));
        });
    };

    Reflect.defineProperty(Collection.prototype, "length", {
        get() {
            return this.cells.length;
        }
    });

    Collection.prototype.has = function (id) {
        return _.some(this.cells, ["id", id]);
    };

    Collection.prototype.get = function (id) {
        return _.find(this.cells, ["id", id]);
    };

    Collection.prototype.add = function (id) {
        if (_.find(this.cells, ["id", id])) {
            throw new Error("Book already added.");
        } else {
            _.push(this.cells, {
                id
            });
        }
        return this;
    };

    Collection.prototype.remove = function (id) {
        const index = _.isNumber(id) ? id : _.indexOf(this.cells, ["id", id]);
        if (index === -1) {
            throw new Error("Invalid book id.");
        } else {
            this.cells.splice(index, 1);
        }
        return this;
    };

    Collection.prototype.show = function () {
        em.emit("clickMenu", "collection");
        em.emit("resetCells");
        em.emit("showCells", this.cells);
        µ.one("#tags").toggleClass("notdisplayed", !this.tags.length);
    };

    Collection.prototype.init = function () {
        req("/collection").send().then((result) => {
            this.tags = result.tags;
            this.cells = cells.getCells(result.books, true);
            this.show();
            µ.one("#nbBooks").text = this.cells.length;
            em.emit("generateTags", this.tags);
        }).catch(err.add);
    };

    return new Collection();
});
