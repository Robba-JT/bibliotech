"use strict";

define("collection", ["cells"], function (cells) {
    var Collection = function Collection() {
        this.tags = {};
        this.cells = [];
        em.once("init", this, this.init);
        em.on("showCollection", this, this.show);
        em.on("addBook", this, function (cell) {
            var _this = this;

            if (!this.has(cell.id)) {
                req("/book/" + cell.id, "POST").send().then(function (result) {
                    cell.update(result, true);
                    _this.cells.push(cell);
                    _this.cells = _.sortBy(_this.cells, ["book.title"]);
                    µ.one("#nbBooks").text = _this.cells.length;
                    if (µ.one("#collection").hasClass("active")) {
                        _this.show();
                    }
                }).catch(function (error) {
                    err.add(error);
                });
            }
        });
        em.on("removeBook", this, function (bookId) {
            var _this2 = this;

            if (this.has(bookId)) {
                req("/book/" + bookId, "DELETE").send().then(function () {
                    _.remove(_this2.cells, ["id", bookId]);
                    µ.one("#nbBooks").text = _this2.cells.length;
                }).catch(function (error) {
                    err.add(error);
                });
            }
        });
        em.on("filtreCollection", this, function () {
            _.forEach(this.cells, function (cell) {
                return cell.filter();
            });
        });
        em.on("filtreTag", this, function (tag) {
            window.scrollTo(0, 0);
            µ.one("#selectedTag span").text = tag;
            µ.one("#selectedTag").toggleClass("notdisplayed", false);
            _.forEach(this.cells, function (cell) {
                return cell.filter();
            });
            em.emit("orderByTag", tag, this.cells);
        });
        em.on("sortCollection", this, function (params) {
            cells.reset();
            cells.show(_.orderBy(this.cells, "book." + params.by, params.sort || "asc"));
        });
        em.on("fromCollection", this, this.get);
    };

    Reflect.defineProperty(Collection.prototype, "length", {
        get: function get() {
            return this.cells.length;
        }
    });

    Collection.prototype.add = function (id) {
        if (_.find(this.cells, ["id", id])) {
            throw new Error("Book already added.");
        } else {
            _.push(this.cells, {
                id: id
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
        var _this3 = this;

        req("/collection").send().then(function (result) {
            µ.many(".waiting, .roundIcon").toggleClass("notdisplayed", true);
            _this3.tags = _.map(result.books, function (book) {
                return {
                    "id": book.id,
                    "tags": book.tags || []
                };
            });
            _this3.cells = _.union(_this3.cells, cells.getCells(result.books, true));
            _this3.show();
            if (result.total === _this3.cells.length) {
                µ.one(".waitAnim").toggleClass("notdisplayed", true);
                µ.one("#nbBooks").text = _this3.cells.length;
            }
            em.emit("generateTags", _this3.tags);
        }).catch(function (error) {
            err.add(error);
        });
        return this;
    };

    Collection.prototype.remove = function (id) {
        var index = _.isNumber(id) ? id : _.indexOf(this.cells, ["id", id]);
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
