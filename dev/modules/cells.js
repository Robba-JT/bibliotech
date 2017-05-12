"use strict";

define("cells", ["hdb", "text!../templates/Cell"], function (hdb, template) {
    var render = hdb.compile(template),
        elt = µ.one("bookcells"),
        thief = new ColorThief(),
        Cell = function Cell(book, inCollection) {
        var _this = this;

        if (!(this instanceof Cell)) {
            return new Cell(book, inCollection);
        }
        this.id = _.isPlainObject(book.id) ? JSON.stringify(book.id) : _.get(book, "id");
        this.src = _.get(book, "src");
        this.book = _.omit(book, "src");
        this.cell = µ.new("cell").set({
            "innerHTML": render(_.merge(this.book, {
                inCollection: inCollection,
                "src": this.src
            })),
            "draggable": true,
            "book": this.id
        }).css({
            width: width
        }).observe("mouseleave", function () {
            _this.cell.one("figure span").toggleClass("notdisplayed", false);
        });
        if (!this.src && (this.book.cover || this.book.alt)) {
            this.src = "/cover/" + this.id + "?" + Math.random().toString(24).slice(2);
        }

        if (_.has(book, "description")) {
            var description = _.get(book, "description"),
                index = description.indexOf(" ", 500);

            this.cell.one("figure span").observe("click", function (event) {
                event.stopPropagation();
                event.element.toggleClass("notdisplayed", true);
            }).html = description.substr(0, Math.max(500, index)) + (index === -1 ? "" : "...");
        }

        this.cell.one(".add").observe("click", function (event) {
            event.stopPropagation();
            _this.add();
        });

        this.cell.one(".remove").observe("click", function (event) {
            event.stopPropagation();
            _this.remove();
        });

        this.cell.observe("click", function () {
            return em.emit("openDetail", _this);
        }).observe("dragstart", function (event) {
            event.element.toggleClass("isDrag", true);
            event.dataTransfer.setData("book", _this.id);
        }).observe("dragend", function (event) {
            event.element.toggleClass("isDrag", false);
        }).observe("dragover", function (event) {
            event.preventDefault();
        }).observe("drop", function (event) {
            event.preventDefault();
            _this.cell.prepend(µ.one("[book='" + event.dataTransfer.getData("book") + "']"));
            if (µ.one("#collection").hasClass("active") && µ.one("#selectedTag span").text) {
                µ.one("#saveorder").toggleClass("notdisplayed", false);
            }
        });

        var cover = this.cell.one("img");
        cover.loaded = function () {
            cover.toggleClass("notdisplayed", false);
            if (cover.siblings.get(0)) {
                cover.siblings.get(0).remove();
            }
            _.assign(_this.book, {
                "palette": thief.getPalette(cover.element)
            });
            if (_this.book.palette && _this.book.palette.length > 2) {
                _this.changeBackground(_this.book.palette[1]);
                _this.cell.observe("mouseover", function () {
                    _this.changeBackground(_this.book.palette[0]);
                });
                _this.cell.observe("mouseleave", function () {
                    _this.changeBackground(_this.book.palette[1]);
                });
            }
        };
        if (this.src) {
            var defLoad = this.defLoad = function () {
                if (_this.isVisible()) {
                    window.removeEventListener("scroll", defLoad);
                    cover.element.src = _this.src;
                } else {
                    window.addEventListener("scroll", defLoad);
                }
            };
        }
        return this;
    },
        Cells = function Cells() {
        this.cells = [];
        em.on("showCells", this, this.show);
        em.on("resetCells", this, this.reset);
        em.on("resize", this, this.resize);
        em.on("saveOrder", this, this.saveOrder);
        em.on("newBook", this, this.newBook);
    },
        updateWidth = function updateWidth() {
        elt.toggleClass("scrolled", true);
        width = ~~(elt.element.scrollWidth / ~~(elt.element.scrollWidth / 257)) - 5 + "px";
        elt.toggleClass("scrolled", false);
    };

    var width = null;

    //Cell
    Cell.prototype.add = function () {
        em.emit("addBook", this);
        this.cell.many("button").toggleClass("notdisplayed");
    };

    Cell.prototype.changeBackground = function (rgb) {
        this.cell.css("background-color", µ.rgbToHex(rgb)).one("figcaption").css("color", µ.isDark(rgb) ? "whitesmoke" : "black");
        return this;
    };

    Cell.prototype.filter = function () {
        var filter = _.words(_.toLower(_.noAccent(µ.one("#selectedSearch span").text))),
            lgFilter = filter.length,
            tag = µ.one("#selectedTag span").text,
            concat = _.toLower(_.noAccent(_.concat(this.book.title, this.book.subtitle || "", this.book.authors || "", this.book.description || "").join(" ")));

        var visible = tag ? _.includes(this.book.tags, tag) : true;
        if (visible && lgFilter) {
            _.forEach(filter, function (word) {
                visible = _.includes(concat, word);
                return visible;
            });
        }
        this.cell.toggleClass("notdisplayed", !visible);
        if (visible && this.defLoad) {
            this.defLoad();
        }
        return this;
    };

    Cell.prototype.isVisible = function () {
        return document.body.scrollTop + window.outerHeight > this.cell.element.offsetTop && this.cell.visible;
    };

    Cell.prototype.resize = function () {
        this.cell.css({
            width: width
        });
        return this;
    };

    Cell.prototype.remove = function () {
        em.emit("removeBook", this.id);
        this.book.inCollection = false;
        if (µ.one("#collection").hasClass("active")) {
            this.cell.remove();
        } else {
            this.cell.many("button").toggleClass("notdisplayed");
        }
    };

    Cell.prototype.update = function (book) {
        var inCollection = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        var volumeInfo = _.get(book, "volumeInfo") || {};
        if (_.get(book, "alt") !== _.get(this.book, "alt")) {
            this.src = "/cover/" + this.id + "?" + Math.random().toString(24).slice(2);
            this.cell.one("img").set("src", this.src);
        }
        _.assign(this.book, _.omit(book, "volumeInfo"), volumeInfo, {
            inCollection: inCollection
        });
        /*
            if (volumeInfo.title) {
                this.cell.one("header").text = volumeInfo.title;
            }
            if (volumeInfo.authors) {
                this.cell.one("figcaption div").text = volumeInfo.authors;
            }
            if (volumeInfo.description) {
                this.cell.one("figure span").text = volumeInfo.description;
            }
        */
        this.cell.one("header").text = this.book.title;
        this.cell.one("figcaption div").text = this.book.authors;
        this.cell.one("figure span").text = this.book.description;
        this.cell.set("book", this.id);
        return this;
    };

    //Cells
    Cells.prototype.getCell = function (book, inCollection) {
        return new Cell(book, inCollection);
    };

    Cells.prototype.getCells = function (books, inCollection) {
        var _this2 = this;

        updateWidth();
        return _.map(books, function (book) {
            return _this2.getCell(book, inCollection);
        });
    };

    Cells.prototype.newBook = function () {
        var cell = new Cell({});
        cell.cell.one("img").trigger("click");
    };

    Cells.prototype.resize = function () {
        updateWidth();
        _.forEach(this.cells, function (cell) {
            return cell.resize();
        });
        return this;
    };

    Cells.prototype.reset = function () {
        elt.html = "";
        this.cells = [];
        µ.one("#saveorder").toggleClass("notdisplayed", true);
        return this;
    };

    Cells.prototype.saveOrder = function () {
        var cells = µ.many("cell").elements,
            params = {
            "tag": µ.one("#selectedTag span").text,
            "list": _.reduce(cells, function (list, one) {
                if (one.visible) {
                    list.push(one.get("book"));
                }
                return list;
            }, [])
        };
        em.emit("updateOrder", params);
        µ.one("#saveorder").toggleClass("notdisplayed", true);
    };

    Cells.prototype.show = function (cells) {
        _.forEach(cells, function (book) {
            elt.append(book.cell.toggleClass("notdisplayed", false));
            if (book.defLoad) {
                book.defLoad();
            }
        });
        this.cells = _.unionBy(this.cells, cells, "id");
        return this;
    };

    window.addEventListener("resize", function () {
        return em.emit("resize");
    });

    return new Cells();
});
