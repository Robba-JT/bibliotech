define("collection", ["lodash", "Request", "Cell", "dom"], function (_, request, Cell, µ) {
    const Collection = function () {
        this.books = [];
    };

    Reflect.defineProperty(Collection.prototype, "length", {
        get() {
            return this.books.length;
        }
    });

    Reflect.defineProperty(Collection.prototype, "tags", {
        get() {
            return this.books.length;
        }
    });

    Collection.prototype.has = function (id) {
        return _.findIndex(this.books, ["id", id]) !== -1;
    };

    Collection.prototype.get = function (id) {
        return _.find(this.books, ["id", id]);
    };

    Collection.prototype.add = function (id) {
        if (_.find(this.books, ["id", id])) {
            throw new Error("Book already added.");
        } else {
            _.push(this.books, {
                id
            });
        }
        return this;
    };

    Collection.prototype.remove = function (id) {
        const index = _.isNumber(id) ? id : _.indexOf(this.books, ["id", id]);
        if (index === -1) {
            throw new Error("Invalid book id.");
        } else {
            this.books.splice(index, 1);
        }
        return this;
    };

    Collection.prototype.init = function () {
        return new Promise((resolve, reject) => {
            request("/collection").send().then((result) => {
                this.books = _.unionBy(this.books, _.map(result, (book) => new Cell(_.assign(book, {
                    "inCollection": true
                }))), "id");
                this.showAll();
                resolve();
            }).catch((error) => {
                console.error("collection.init", error);
                reject();
            });
        });
    };

    Collection.prototype.each = function (callback) {
        if (_.isFunction(callback)) {
            _.forEach(this.books, callback);
        } else {
            throw new Error("Invalid callback.");
        }
        return this;
    };

    Collection.prototype.showAll = function () {
        const elt = µ.one("bookcells");
        this.each((book) => {
            elt.html += book.html;
        });
    };

    return new Collection();
});
