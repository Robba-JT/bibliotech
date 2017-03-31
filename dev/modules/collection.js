define("collection", ["cells"], function (cells) {
    const Collection = function () {
        emitter.once("initCollect", this, this.init);

        emitter.on("showCollection", this, this.showAll);

        emitter.on("addBook", this, function (bookId) {
            if (!this.has(bookId)) {
                request(`/book/${bookId}`, "POST").send().then((result) => {
                    this.cells.push(cells.getCell(result, true));
                    this.cells = _.sortBy(this.cells, ["book.title"]);
                    µ.one("#nbBooks").text = this.cells.length;
                }).catch((error) => console.error(error));
            }
        });

        emitter.on("removeBook", this, function (bookId) {
            if (this.has(bookId)) {
                request(`/book/${bookId}`, "DELETE").send().then(() => {
                    _.remove(this.cells, ["id", bookId]);
                    µ.one("#nbBooks").text = this.cells.length;
                }).catch((error) => console.error(error));
            }
        });
    };

    Reflect.defineProperty(Collection.prototype, "length", {
        get() {
            return this.cells.length;
        }
    });

    Reflect.defineProperty(Collection.prototype, "tags", {
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

    Collection.prototype.showAll = function () {
        emitter.emit("clickMenu", "collection");
        emitter.emit("resetCells");
        emitter.emit("showCells", this.cells);
        µ.one("#tags").toggleClass("notdisplayed", !this.tags.length);
    };

    Collection.prototype.init = function () {
        request("/collection").send().then((result) => {
            this.tags = result.tags;
            this.cells = cells.getCells(result.books, true);
            this.showAll();
            µ.one("#nbBooks").text = this.cells.length;
        }).catch((error) => {
            console.error("collection.init", error);
        });
    };

    return new Collection();
});
