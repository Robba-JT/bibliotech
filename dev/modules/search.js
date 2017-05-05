"use strict";

define("search", ["cells", "collection", "Window", "text!../templates/search"], function (cells, collection, Window, template) {
    var Search = function Search() {
        var _this = this;

        this.last = {};
        this.window = new Window("search", template);

        em.on("openSearch", function () {
            _this.window.one("form").reset();
            _this.window.open();
        });
        em.on("filtreSearch", this, function () {
            _.forEach(this.last.cells, function (cell) {
                return cell.filter();
            });
        });
        em.on("associated", function (associated) {
            cells.reset();
            if (_.get(_this.last, "qs.associated") !== associated) {
                _this.last = {
                    "qs": {
                        associated: associated
                    }
                };
                _this.last.books = [];
                _this.associated();
            } else {
                cells.show(_this.last.cells);
            }
        });
        em.on("search", this, function (qs) {
            if (!_.isEqual(qs, _this.last.qs)) {
                _this.last.qs = qs;
                _this.last.books = [];
                _this.last.cells = [];
                cells.reset();
                µ.many(".waiting, .roundIcon, .waitAnim").toggleClass("notdisplayed", false);
                µ.one("sort.active").toggleClass("active", false);
                em.emit("resetFilter");
                em.emit("clickMenu", "recherche");
                _this.get(qs);
            } else {
                cells.reset();
                cells.show(_this.last.cells);
            }
        });

        µ.one("form[name=searchForm]").observe("submit", function (event) {
            event.preventDefault();
            var search = event.element.parser();
            if (!_.isEqual(search, _this.last.qs)) {
                _this.window.close();
                µ.many(".waiting, .roundIcon, .waitAnim").toggleClass("notdisplayed", false);
                µ.one("sort.active").toggleClass("active", false);
                _this.last.qs = search;
                _this.last.books = [];
                _this.last.cells = [];
                cells.reset();
                _this.get(search);
                event.element.reset();
                em.emit("resetFilter");
                em.emit("clickMenu", "recherche");
            }
            return false;
        });
    };

    Search.prototype.show = function (books) {
        this.last.books = _.unionBy(this.last.books, books, "id");
        var newCells = _.map(books, function (book) {
            return collection.get(book.id) || cells.getCell(book);
        });
        this.last.cells = _.unionBy(this.last.cells, newCells, "id");
        cells.show(newCells);
        µ.many(".waiting, .roundIcon").toggleClass("notdisplayed", true);
        return this;
    };

    Search.prototype.associated = function () {
        var _this2 = this;

        µ.many(".waiting, .roundIcon, .waitAnim").toggleClass("notdisplayed", false);
        µ.one("sort.active").toggleClass("active", false);
        em.emit("resetFilter");
        em.emit("clickMenu", "recherche");
        var storeBooks = store.get(this.last.qs);
        if (storeBooks) {
            this.show(storeBooks);
            µ.one(".waitAnim").toggleClass("notdisplayed", true);
        } else {
            req("/associated/" + this.last.qs.associated).send().then(function (result) {
                _this2.show(result.books);
                µ.one(".waitAnim").toggleClass("notdisplayed", true);
                store.set(_this2.last.qs, result.books);
            }).catch(function (error) {
                return err.add(error);
            });
        }
        return this;
    };

    Search.prototype.request = function () {
        var _this3 = this;

        req("/search").send(_.merge({}, this.last.qs, {
            "index": this.last.books.length
        })).then(function (result) {
            _this3.show(result.books);
            if (result.books.length === 40 && _this3.last.books.length < 400) {
                _this3.request();
            } else {
                µ.one(".waitAnim").toggleClass("notdisplayed", true);
                store.set(_this3.last.qs, _this3.last.books);
            }
            return false;
        }).catch(function (error) {
            err.add(error);
        });
    };

    Search.prototype.get = function () {
        var storeBooks = store.get(this.last.qs);
        if (storeBooks) {
            this.show(storeBooks);
            µ.one(".waitAnim").toggleClass("notdisplayed", true);
        } else {
            this.request();
        }
        return this;
    };

    Search.prototype.recommanded = function () {
        var _this4 = this;

        this.window.close();
        if (!_.isEqual("recommanded", this.last.qs)) {
            this.last.qs = "recommanded";
            var storeBooks = store.get(this.last.qs);
            if (storeBooks) {
                this.show(storeBooks);
                µ.one(".waitAnim").toggleClass("notdisplayed", true);
            } else {
                req("/recommanded", "POST").send().then(function (result) {
                    _this4.show(result);
                    store.set(_this4.last.qs, result);
                }).catch(function (error) {
                    err.add(error);
                });
            }
        } else {
            cells.reset();
            cells.show(this.last.cells);
        }
        return this;
    };

    return new Search();
});
