define("cells", ["hdb", "text!../templates/Cell"], function (hdb, template) {
    const render = hdb.compile(template),
        elt = µ.one("bookcells"),
        thief = new ColorThief(),
        Cell = function (book, inCollection) {
            if (!(this instanceof Cell)) {
                return new Cell(book, inCollection);
            }
            this.id = book.id;
            this.src = _.get(book, "src");
            this.book = _.omit(book, "src");
            this.cell = µ.new("cell").set({
                "innerHTML": render(_.merge(this.book, {
                    inCollection,
                    "src": this.src
                })),
                "draggable": true,
                "id": `id${this.book.id}`
            }).css({
                width
            }).observe("mouseleave", () => {
                this.cell.one("figure span").toggleClass("notdisplayed", false);
            });
            if (!this.src && (this.book.cover || this.book.alt)) {
                this.src = `/cover/${this.id}?${Math.random().toString(24).slice(2)}`;
            }

            const index = _.get(book, "description").indexOf(" ", 500),
                cover = this.cell.one("img");

            this.cell.one("figure span").observe("click", (event) => {
                event.stopPropagation();
                event.element.toggleClass("notdisplayed", true);
            }).html = _.get(book, "description").substr(0, Math.max(500, index)) + (index === -1 ? "" : "...");

            this.cell.one(".add").observe("click", (event) => {
                event.stopPropagation();
                this.add();
            });

            this.cell.one(".remove").observe("click", (event) => {
                event.stopPropagation();
                this.remove();
            });

            this.cell.observe("click", () => em.emit("openDetail", this)).observe("dragstart", (event) => {
                event.dataTransfer.setData("id", `id${this.id}`);
            }).observe("dragover", (event) => {
                event.preventDefault();
            }).observe("drop", (event) => {
                event.preventDefault();
                this.cell.prepend(µ.one(`#${event.dataTransfer.getData("id")}`));
            });

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
        },
        updateWidth = function () {
            elt.toggleClass("scrolled", true);
            width = `${~~(elt.element.scrollWidth / ~~(elt.element.scrollWidth / 257)) - 5}px`;
            elt.toggleClass("scrolled", false);
        };

    let width = null;

    Cell.prototype.filter = function (filtre) {
        if (filtre) {
            const concat = _.toLower(_.concat(this.book.title, this.book.subtitle || "", this.book.authors || "", this.book.description || "").join("")),
                visible = _.includes(concat, _.toLower(filtre));

            this.cell.toggleClass("notdisplayed", !visible);
            if (visible && this.defLoad) {
                this.defLoad();
            }
        } else {
            this.cell.toggleClass("notdisplayed", false);
        }
        return this;
    };

    Cell.prototype.byTag = function (tag) {
        this.cell.toggleClass("notdisplayed", !_.includes(this.book.tags, tag));
        if (this.defLoad) {
            this.defLoad();
        }
        return this;
    };

    Cell.prototype.changeBackground = function (rgb) {
        this.cell.css("background-color", µ.rgbToHex(rgb)).one("figcaption").css("color", µ.isDark(rgb) ? "whitesmoke" : "black");
        return this;
    };

    Cell.prototype.resize = function () {
        this.cell.css({
            width
        });
        return this;
    };

    Cell.prototype.add = function () {
        em.emit("addBook", this);
        this.cell.many("button").toggleClass("notdisplayed");
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
        if (_.get(book, "alt") !== _.get(this.book, "alt")) {
            this.src = `/cover/${this.id}?${Math.random().toString(24).slice(2)}`;
            this.cell.one("img").set("src", this.src);
        }
        _.assign(this.book, book, {
            inCollection
        });
        return this;
    };

    Cell.prototype.isVisible = function () {
        return document.body.scrollTop + window.outerHeight > this.cell.element.offsetTop && this.cell.visible;
    };

    Cells.prototype.resize = function () {
        updateWidth();
        _.forEach(this.cells, (cell) => cell.resize());
        return this;
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

    Cells.prototype.reset = function () {
        elt.html = "";
        this.cells = [];
        return this;
    };

    Cells.prototype.getCell = function (book, inCollection) {
        return new Cell(book, inCollection);
    };

    Cells.prototype.getCells = function (books, inCollection) {
        updateWidth();
        return _.map(books, (book) => this.getCell(book, inCollection));
    };

    window.addEventListener("resize", () => em.emit("resize"));

    return new Cells();
});
