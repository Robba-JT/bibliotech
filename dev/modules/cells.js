define("cells", ["hdb", "text!../templates/Cell"], function (hdb, template) {
    const render = hdb.compile(template),
        elt = µ.one("bookcells"),
        thief = new ColorThief(),
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
                "innerHTML": render(book),
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

            if (_.get(book, "cover") || _.get(book, "alt")) {
                const defLoad = this.defLoad = () => {
                    const cover = this.cell.one("img");
                    if (!cover.get("src") && this.isVisible()) {
                        window.removeEventListener("scroll", defLoad);
                        cover.loaded = () => {
                            cover.toggleClass("notdisplayed", false);
                            cover.siblings.get(0) && cover.siblings.get(0).remove();
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
                        cover.element.src = book.alt || `/cover/${this.book.id}`;
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
        };

    let width = `${~~(elt.element.offsetWidth / ~~(elt.element.offsetWidth / 257)) - 10}px`;

    Cell.prototype.filter = function (filtre) {
        if (!filtre) {
            this.cell.toggleClass("notdisplayed", false);
        } else {
            const concat = _.toLower(_.concat(this.book.title, this.book.subtitle || "", this.book.authors || "", this.book.description || "").join("")),
                visible = _.includes(concat, _.toLower(filtre));

            this.cell.toggleClass("notdisplayed", !visible);
            if (visible) {
                this.defLoad();
            }
        }
    };

    Cell.prototype.byTag = function (tag) {
        this.cell.toggleClass("notdisplayed", !_.includes(this.book.tags, tag));
        this.defLoad();
    };

    Cell.prototype.changeBackground = function (rgb) {
        this.cell.css("background-color", µ.rgbToHex(rgb)).one("figcaption").css("color", µ.isDark(rgb) ? "whitesmoke" : "black");
    };

    Cell.prototype.resize = function () {
        this.cell.css({
            width
        });
    };

    Cell.prototype.isVisible = function () {
        return document.body.scrollTop + window.outerHeight > this.cell.element.offsetTop && window.getComputedStyle(this.cell.element).visibility === "visible" && window.getComputedStyle(this.cell.element).display !== "none";
    };

    Cells.prototype.resize = function () {
        width = `${~~(elt.element.offsetWidth / ~~(elt.element.offsetWidth / 257)) - 8}px`;
        _.forEach(this.cells, (cell) => cell.resize());
    };

    Cells.prototype.show = function (cells) {
        _.forEach(cells, (book) => {
            elt.append(book.cell.toggleClass("notdisplayed", false));
            book.defLoad && book.defLoad();
        });
        this.cells = _.unionBy(this.cells, cells, "id");
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

    window.addEventListener("resize", () => em.emit("resize"));

    return new Cells();
});
