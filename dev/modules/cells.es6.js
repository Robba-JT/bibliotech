define("cells", ["hdb", "text!../templates/Cell"], function (hdb, template) {
    const render = hdb.compile(template),
        elt = µ.one("bookcells"),
        thief = new ColorThief(),
        Cell = function (book, inCollection) {
            if (!(this instanceof Cell)) {
                return new Cell(book, inCollection);
            }
            this.id = _.isPlainObject(book.id) ? JSON.stringify(book.id) : _.get(book, "id");
            this.src = _.get(book, "src");
            this.book = _.omit(book, "src");
            this.cell = µ.new("cell").set({
                "innerHTML": render(_.merge(this.book, {
                    inCollection,
                    "src": this.src
                })),
                "draggable": true,
                "book": this.id
            }).css({
                width
            }).observe("mouseleave", () => {
                this.cell.one("figure span").toggleClass("notdisplayed", false);
            });
            if (!this.src && (this.book.cover || this.book.alt)) {
                this.src = `/cover/${this.id}?${Math.random().toString(24).slice(2)}`;
            }

            if (_.has(book, "description")) {
                const description = _.get(book, "description"),
                    index = description.indexOf(" ", 500);

                this.cell.one("figure span").observe("click", (event) => {
                    event.stopPropagation();
                    event.element.toggleClass("notdisplayed", true);
                }).html = description.substr(0, Math.max(500, index)) + (index === -1 ? "" : "...");
            }

            this.cell.one(".add").observe("click", (event) => {
                event.stopPropagation();
                this.add();
            });

            this.cell.one(".remove").observe("click", (event) => {
                event.stopPropagation();
                this.remove();
            });

            this.cell.observe("click", () => em.emit("openDetail", this)).observe("dragstart", (event) => {
                event.element.toggleClass("isDrag", true);
                event.dataTransfer.setData("book", this.id);
            }).observe("dragend", (event) => {
                event.element.toggleClass("isDrag", false);
            }).observe("dragover", (event) => {
                event.preventDefault();
            }).observe("drop", (event) => {
                event.preventDefault();
                this.cell.prepend(µ.one(`[book='${event.dataTransfer.getData("book")}']`));
                if (µ.one("#collection").hasClass("active") && µ.one("#selectedTag span").text) {
                    µ.one("#saveorder").toggleClass("notdisplayed", false);
                }
            });

            const cover = this.cell.one("img");
            cover.loaded = () => {
                cover.toggleClass("notdisplayed", false);
                if (cover.siblings.get(0)) {
                    cover.siblings.get(0).remove();
                }
                _.assign(this.book, {
                    "palette": thief.getPalette(cover.element)
                });
                if (this.book.palette && this.book.palette.length > 2) {
                    this.changeBackground(this.book.palette[1]);
                    this.cell.observe("mouseover", () => {
                        this.changeBackground(this.book.palette[0]);
                    });
                    this.cell.observe("mouseleave", () => {
                        this.changeBackground(this.book.palette[1]);
                    });
                }
            };
            if (this.src) {
                const defLoad = this.defLoad = () => {
                    if (this.isVisible()) {
                        window.removeEventListener("scroll", defLoad);
                        cover.element.src = this.src;
                    } else {
                        window.addEventListener("scroll", defLoad);
                    }
                };
            }
            return this;
        },
        Cells = function () {
            this.cells = [];
            em.on("showCells", this, this.show);
            em.on("resetCells", this, this.reset);
            em.on("resize", this, this.resize);
            em.on("saveOrder", this, this.saveOrder);
            em.on("newBook", this, this.newBook);
            em.on("getCell", (book) => em.emit("fromCollection", book.id) || this.getCell(book));
            em.on("cellsReset", this, this.reset);
            em.on("cellsShow", this, this.show);
        },
        updateWidth = function () {
            elt.toggleClass("scrolled", true);
            width = `${~~(elt.element.scrollWidth / ~~(elt.element.scrollWidth / 257)) - 5}px`;
            elt.toggleClass("scrolled", false);
        };

    let width = null;

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
        const filter = _.words(_.toLower(_.noAccent(µ.one("#selectedSearch span").text))),
            lgFilter = filter.length,
            tag = µ.one("#selectedTag span").text,
            concat = _.toLower(_.noAccent(_.concat(this.book.title, this.book.subtitle || "", this.book.authors || "", this.book.description || "").join(" ")));

        var visible = tag ? _.includes(this.book.tags, tag) : true;
        if (visible && lgFilter) {
            _.forEach(filter, (word) => {
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
            width
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

    Cell.prototype.update = function (book, inCollection = false) {
        const volumeInfo = _.get(book, "volumeInfo") || {};
        if (_.get(book, "alt") !== _.get(this.book, "alt")) {
            this.src = `/cover/${this.id}?${Math.random().toString(24).slice(2)}`;
            this.cell.one("img").set("src", this.src);
        }
        _.assign(this.book, _.omit(book, "volumeInfo"), volumeInfo, {
            inCollection
        });
        this.cell.one("header").text = this.book.title;
        this.cell.one("figcaption div").text = this.book.authors;
        this.cell.one("figure span").html = this.book.description;
        this.cell.set("book", this.id);
        return this;
    };

    //Cells
    Cells.prototype.getCell = function (book, inCollection) {
        return new Cell(book, inCollection);
    };

    Cells.prototype.getCells = function (books, inCollection) {
        updateWidth();
        return _.map(books, (book) => this.getCell(book, inCollection));
    };

    Cells.prototype.newBook = function () {
        const cell = new Cell({
            "id": {
                "user": em.emit("getUser")
            }
        });
        cell.cell.one("img").trigger("click");
    };

    Cells.prototype.resize = function () {
        updateWidth();
        _.forEach(this.cells, (cell) => cell.resize());
        return this;
    };

    Cells.prototype.reset = function () {
        elt.html = "";
        this.cells = [];
        µ.one("#saveorder").toggleClass("notdisplayed", true);
        return this;
    };

    Cells.prototype.saveOrder = function () {
        const cells = µ.many("cell").elements,
            params = {
                "tag": µ.one("#selectedTag span").text,
                "list": _.reduce(cells, (list, one) => {
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
        _.forEach(cells, (book) => {
            elt.append(book.cell.toggleClass("notdisplayed", false));
            if (book.defLoad) {
                book.defLoad();
            }
        });
        this.cells = _.unionBy(this.cells, cells, "id");
        return this;
    };

    window.addEventListener("resize", () => em.emit("resize"));

    return new Cells();
});
