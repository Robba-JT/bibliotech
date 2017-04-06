define("cells", ["hdb", "text!../templates/Cell"], function (hdb, template) {
    const render = hdb.compile(template),
        elt = µ.one("bookcells"),
        thief = new ColorThief(),
        width = `${~~(elt.element.offsetWidth / ~~(elt.element.offsetWidth / 257)) - 8}px`,
        Cell = function (book, inCollection = false) {
            if (!(this instanceof Cell)) {
                return new Cell(book, inCollection);
            }
            this.id = book.id;
            this.book = _.assign(book, {
                inCollection,
                "detailed": false
            });
            this.cell = µ.new("article").toggleClass("bookcell").set({
                "innerHTML": render(_.assign({}, book, {
                    "source": _.get(book, "cover") ? `/cover/${book.id}` : "",
                    "acc": _.get(book, "access") === "SAMPLE" ? "" : "notdisplayed",
                    "add": inCollection ? "notdisplayed" : "",
                    "remove": inCollection ? "" : "notdisplayed",
                    "pers": _.isPlainObject(book.id) ? "" : "notdisplayed",
                    "rec": _.isPlainObject(book.id) ? "" : "notdisplayed"
                })),
                "draggable": true,
                "id": `id${book.id}`
            }).css({
                width
            }).observe("mouseleave", () => {
                this.cell.one("figure span").toggleClass("notdisplayed", false);
            });
            const index = _.get(book, "description").indexOf(" ", 500);
            this.cell.one("figure span").observe("click", (event) => {
                event.stopPropagation();
                event.element.toggleClass("notdisplayed", true);
            }).html = _.get(book, "description").substr(0, Math.max(500, index)) + (index !== -1 ? "..." : "");

            if (_.has(book, "cover")) {
                const cover = this.cell.one("img");
                cover.loaded = () => {
                    cover.toggleClass("notdisplayed", false);
                    cover.siblings.get(0).toggleClass("notdisplayed");
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
            }

            this.cell.one(".add").observe("click", () => {
                event.stopPropagation();
                this.cell.many("button").toggleClass("notdisplayed");
                this.book.inCollection = true;
                em.emit("addBook", this.id);
            });

            this.cell.one(".remove").observe("click", (event) => {
                event.stopPropagation();
                em.emit("removeBook", this.id);
                this.book.inCollection = false;
                if (µ.one("#collection").hasClass("active")) {
                    this.cell.remove();
                } else {
                    this.cell.many("button").toggleClass("notdisplayed");
                }
            });

            this.cell.observe("click", () => {
                if (this.book.detailed || this.book.inCollection) {
                    em.emit("openDetail", this.book);
                } else {
                    req(`/detail/${this.id}`).send().then((detail) => {
                        _.assign(this.book, detail, {
                            "detailed": true
                        });
                        em.emit("openDetail", this.book);
                    }).catch((error) => {
                        err.add(error);
                    });
                }
            }).observe("dragstart", (event) => {
                event.dataTransfer.setData("id", `id${this.id}`);
            }).observe("dragover", (event) => {
                event.preventDefault();
            }).observe("drop", (event) => {
                event.preventDefault();
                this.cell.prepend(µ.one(`#${event.dataTransfer.getData("id")}`));
            });

            return this;
        },
        Cells = function () {
            this.cells = [];
            em.on("showCells", this, this.show);
            em.on("resetCells", this, this.reset);
        };

    Cell.prototype.filter = function (filtre) {
        if (!filtre) {
            this.cell.toggleClass("notdisplayed", false);
        } else {
            const concat = _.toLower(_.concat(this.book.title, this.book.subtitle || "", this.book.authors || "", this.book.description || "").join(""));
            this.cell.toggleClass("notdisplayed", !_.includes(concat, _.toLower(filtre)));
        }
    };

    Cell.prototype.byTag = function (tag) {
        this.cell.toggleClass("notdisplayed", !_.includes(this.book.tags, tag));
    };

    Cell.prototype.changeBackground = function (rgb) {
        this.cell.css("background-color", µ.rgbToHex(rgb)).one("figcaption").css("color", µ.isDark(rgb) ? "whitesmoke" : "black");
    };

    Cells.prototype.show = function (cells) {
        this.cells = _.unionBy(this.cells, cells, "id");
        _.forEach(cells, (book) => {
            elt.append(book.cell.toggleClass("notdisplayed", false));
        });
    };

    Cells.prototype.reset = function () {
        elt.html = "";
        this.cells = [];
    };

    Cells.prototype.getCell = function (book, inCollection) {
        return new Cell(book, inCollection);
    };

    Cells.prototype.getCells = function (books, inCollection) {
        return _.map(books, (book) => this.getCell(book, inCollection));
    };

    return new Cells();
});
