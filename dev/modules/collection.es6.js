define("collection", ["cells"], function (cells) {
    const Collection = function () {
        this.tags = {};
        this.cells = [];
        em.once("init", this, this.init);
        em.on("showCollection", this, this.show);
        em.on("addBook", this, function (cell) {
            if (!this.has(cell.id)) {
                req(`/book/${cell.id}`, "POST").send().then((result) => {
                    cell.update(result, true);
                    this.cells.push(cell);
                    this.cells = _.sortBy(this.cells, ["book.title"]);
                    µ.one("#nbBooks").text = this.cells.length;
                    if (µ.one("#collection").hasClass("active")) {
                        this.show();
                    }
                }).catch((error) => {
                    err.add(error);
                });
            }
        });
        em.on("removeBook", this, function (bookId) {
            if (this.has(bookId)) {
                req(`/book/${bookId}`, "DELETE").send().then(() => {
                    _.remove(this.cells, ["id", bookId]);
                    µ.one("#nbBooks").text = this.cells.length;
                }).catch((error) => {
                    err.add(error);
                });
            }
        });
        em.on("filtreCollection", this, function () {
            _.forEach(this.cells, (cell) => cell.filter());
        });
        em.on("filtreTag", this, function (tag) {
            window.scrollTo(0, 0);
            µ.one("#selectedTag span").text = tag;
            µ.one("#selectedTag").toggleClass("notdisplayed", false);
            _.forEach(this.cells, (cell) => cell.filter());
            em.emit("orderByTag", tag, this.cells);
        });
        em.on("fromCollection", this, this.get);
    };

    Reflect.defineProperty(Collection.prototype, "length", {
        get() {
            return this.cells.length;
        }
    });

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

    Collection.prototype.get = function (id) {
        return _.find(this.cells, ["id", id]);
    };

    Collection.prototype.has = function (id) {
        return _.some(this.cells, ["id", id]);
    };

    Collection.prototype.init = function () {
        req("/collection").send().then((result) => {
            µ.many(".waiting, .roundIcon").toggleClass("notdisplayed", true);
            this.tags = _.map(result.books, (book) => {
                return {
                    "id": book.id,
                    "tags": book.tags || []
                }
            });
            this.cells = _.union(this.cells, cells.getCells(result.books, true));
            this.show();
            if (result.total === this.cells.length) {
                µ.one(".waitAnim").toggleClass("notdisplayed", true);
                µ.one("#nbBooks").text = this.cells.length;
            }
            em.emit("generateTags", this.tags);
        }).catch((error) => {
            err.add(error);
        });
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
        em.emit("resetFilter", !_.isEmpty(this.tags));
        em.emit("resetCells");
        em.emit("showCells", this.cells);
        return this;
    };

    return new Collection();
});
