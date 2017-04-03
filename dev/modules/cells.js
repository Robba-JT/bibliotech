define("cells", ["hdb", "text!../templates/Cell"], function (hdb, template) {
    const render = hdb.compile(template),
        elt = µ.one("bookcells"),
        thief = new ColorThief(),
        width = `${~~(elt.element.offsetWidth / ~~(elt.element.offsetWidth / 257)) - 8}px`,
        Cell = function (book, inCollection) {
            if (!(this instanceof Cell)) {
                return new Cell(book, inCollection);
            }
            this.id = book.id;
            this.book = book;
            this.cell = µ.new("article").toggleClass("bookcell").set({
                "innerHTML": render(_.assign({}, book, {
                    "source": _.get(book, "cover") ? `/cover/${book.id}` : "",
                    "acc": _.get(book, "access") === "SAMPLE" ? "" : "notdisplayed",
                    "add": inCollection ? "notdisplayed" : "",
                    "remove": inCollection ? "" : "notdisplayed",
                    "pers": _.isPlainObject(book.id) ? "" : "notdisplayed",
                    "rec": _.isPlainObject(book.id) ? "" : "notdisplayed"
                })),
                "title": _.get(book, "description").substr(0, 500) + (_.get(book, "description").length > 500 ? "..." : ""),
                "draggable": true,
                "id": `id${book.id}`
            }).css({
                width
            });

            if (_.has(book, "cover")) {
                const cover = this.cell.one("img");
                cover.loaded = () => {
                    cover.toggleClass("notdisplayed", false);
                    cover.siblings.get(0).toggleClass("notdisplayed");
                    this.palette = thief.getPalette(cover.element);
                    if (this.palette && this.palette.length > 2) {
                        this.changeBackground(this.palette[1]);
                        this.cell.observe("mouseover", () => {
                            this.changeBackground(this.palette[0]);
                        });
                        this.cell.observe("mouseleave", () => {
                            this.changeBackground(this.palette[1]);
                        });
                    }
                };
            }

            this.cell.one(".add").observe("click", () => {
                event.stopPropagation();
                this.cell.many("button").toggleClass("notdisplayed");
                em.emit("addBook", this.id);
            });

            this.cell.one(".remove").observe("click", (event) => {
                event.stopPropagation();
                em.emit("removeBook", this.id);
                if (µ.one("#collection").hasClass("active")) {
                    this.cell.remove();
                } else {
                    this.cell.many("button").toggleClass("notdisplayed");
                }
            });

            this.cell.observe("click", () => {
                req(`/detail/${this.id}`).send().then((detail) => {
                    em.emit("openDetail", detail);
                }).catch(err.add);
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
        rgbToHex = function (rgb) {
            return `#${((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).substr(1)}`;
        },
        darkTest = function (rgb) {
            return 0.3 * rgb[0] + 0.59 * rgb[1] + 0.11 * rgb[2] <= 128;
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

    Cell.prototype.changeBackground = function (rgb) {
        this.cell.css("background-color", rgbToHex(rgb)).one("figcaption").css("color", darkTest(rgb) ? "whitesmoke" : "black");
    };

    Cells.prototype.show = function (cells) {
        this.cells = _.unionBy(this.cells, cells, "id");
        _.forEach(cells, (book) => {
            elt.append(book.cell);
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
        return _.map(books, (book) => this.getCell(book, Boolean(inCollection)));
    };

    return new Cells();
});
