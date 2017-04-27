define("detail", ["Window", "hdb", "cloud", "cells", "text!../templates/detail", "text!../templates/Tag", "text!../templates/MostAdded", "text!../templates/Preview"], function (Window, hdb, cloud, cells, tempDetail, tempTag, tempAdded, tempPreview) {
    const renderDetail = hdb.compile(tempDetail),
        renderTag = hdb.compile(tempTag),
        renderAdded = hdb.compile(tempAdded),
        thief = new ColorThief(),
        detail = µ.one("detail"),
        Detail = function () {
            em.on("openDetail", this, (cell) => {
                if (cell.book.detailed || cell.book.inCollection) {
                    this.open(cell);
                } else {
                    const storeDetail = store.get(cell.id);
                    if (storeDetail) {
                        _.assign(cell.book, storeDetail);
                        this.open(cell);
                    } else {
                        req(`/detail/${cell.id}`).send().then((result) => {
                            _.assign(cell.book, result, {
                                "detailed": true
                            });
                            store.set(cell.id, cell.book);
                            this.open(cell);
                        }).catch((error) => {
                            err.add(error);
                        });
                    }
                }
            });
        },
        previewWindow = new Window("preview", tempPreview);

    Detail.prototype.init = function (cell) {
        req(`/mostAdded/${cell.id}`).send().then((result) => this.mostAdded(result)).catch((error) => err.add(error));
        this.cell = cell;
        this.detailBook = _.assign({
            "note": 0,
            "tags": [],
            "comment": ""
        }, this.cell.book);

        detail.set("innerHTML", renderDetail(_.merge(this.detailBook, {
            "src": this.cell.src
        })));
        detail.one(".closeWindow").observe("click", () => {
            this.close();
        });
        detail.one("#detailSave").observe("click", () => this.save());
        detail.one("#detailAdd").observe("click", () => this.add());
        detail.one("#detailGbooks").observe("click", () => this.googleLink());
        detail.one("#detailConnex").observe("click", () => this.connex());
        detail.one("#detailPreview").observe("click", () => this.preview());
        detail.one("#detailRecommand").observe("click", () => this.recommand());
        detail.css({
            "top": `${document.body.scrollTop}px`
        }).toggleClass("notdisplayed", false);
        detail.one("form[name=formTag]").observe("submit", (event) => {
            event.preventDefault();
            this.addTag(event.element.parser());
            event.element.reset();
        });
        if (this.detailBook.inCollection) {
            detail.many(".inCollection").toggleClass("notdisplayed", false);
        }
        if (this.detailBook.note) {
            const notes = detail.many(".note");
            notes.length = this.detailBook.note;
            notes.toggleClass("empty select");
        }
        detail.css("background", "radial-gradient(circle at 50%, whitesmoke 0%, #909090 100%)");
        detail.many(".note").observe("mouseenter", (event) => {
            const value = _.parseInt(event.element.get("note")),
                note = this.detailBook.note || 0,
                notes = detail.many(".note");

            notes.each((elt, index) => {
                elt.toggleClass("plus", index >= note && index < value)
                    .toggleClass("minus", index < note && index >= value);
            });
        }).observe("mouseleave", () => {
            detail.many(".note").each((elt) => {
                elt.toggleClass("plus minus", false);
            });
        }).observe("click", (event) => {
            const thisNote = _.parseInt(event.element.get("note"));
            if (this.detailBook.note === 1 && thisNote === 1) {
                this.detailBook.note = 0;
            } else {
                this.detailBook.note = thisNote;
            }
            detail.many(".note").each((elt, index) => {
                elt.toggleClass("empty", index >= this.detailBook.note).toggleClass("select", index < this.detailBook.note);
            });
        });
        detail.one("[name=userComment]").observe("change", (event) => {
            this.detailBook.comment = event.element.value;
            this.detailBook.date = event.element.value ? new Date() : null;
        });
        detail.one("#detailCover").observe("load", () => {
            this.detailBook.palette = thief.getPalette(detail.one("#detailCover").element);
            if (this.detailBook.palette && this.detailBook.palette.length) {
                detail.css("background", `radial-gradient(circle at 50%, whitesmoke 0%,${µ.rgbToHex(this.detailBook.palette[0])} 100%)`);
            }
        });
        detail.one("div.upload").observe("click", () => detail.one("[type=file]").trigger("click"));
        detail.one("[type=file]").observe("change", (event) => {
            detail.many("#noCover").toggleClass("notdisplayed", event.element.files.length);
            if (event.element.files.length) {
                const reader = new FileReader();
                reader.addEventListener("load", (result) => {
                    detail.one("#detailCover").toggleClass("notdisplayed", false).set("src", result.target.result);
                    this.detailBook.alt = result.target.result;
                });
                reader.readAsDataURL(event.element.files[0]);
                detail.one("form[name=uploadImg]").reset();
            }
        });
        detail.one("datalist").html = cloud.options.join("");
        detail.many("[searchby]").observe("click", (event) => {
            this.close();
            em.emit("search", {
                "by": event.element.get("searchby"),
                "search": event.element.text,
                "lang": document.body.lang
            });
        });
        detail.many(".tag button").observe("click", (event) => {
            if (event.element.hasClass("libelle")) {
                this.byTag(event.element.text);
            } else {
                this.removeTag(event.element);
            }
        });
        em.on("resize", this, this.close);
        em.on("closeAll", this, this.close);
    };

    Detail.prototype.open = function (cell) {
        µ.one(".waiting").toggleClass("notdisplayed", false);
        µ.one("html").toggleClass("overflown", true);
        this.init(cell);
        return this;
    };

    Detail.prototype.close = function () {
        detail.toggleClass("notdisplayed", true);
        µ.one(".waiting").toggleClass("notdisplayed", true);
        µ.one("html").toggleClass("overflown", false);
        return this;
    };

    Detail.prototype.mostAdded = function (books) {
        if (books.length) {
            const mostAdded = detail.one("#mostAdded"),
                divMostAdded = mostAdded.one("div");

            mostAdded.many("*").toggleClass("notdisplayed", false);
            _.forEach(books, (book) => {
                const cell = µ.new("div").toggleClass("mostAdded").set("innerHTML", renderAdded(book)).appendTo(divMostAdded);
                if (book.description) {
                    const limit = 200,
                        index = _.get(book, "description").indexOf(" ", limit);

                    cell.one("span").html = _.get(book, "description").substr(0, Math.max(limit, index)) + (index === -1 ? "" : "...");
                    cell.one("span").observe("click", (event) => {
                        event.stopPropagation();
                        event.element.toggleClass("notdisplayed", true);
                    });
                    cell.observe("mouseleave", () => {
                        cell.one("span").toggleClass("notdisplayed", false);
                    });
                }
                if (book.cover) {
                    const img = cell.one("img");
                    book.src = `/cover/${book.id}?${Math.random().toString(24).slice(2)}`;
                    img.loaded = () => {
                        cell.one(".altCover").remove();
                        img.toggleClass("notdisplayed", false);
                    };
                    img.set("src", book.src);
                }
                cell.observe("click", () => {
                    em.emit("openDetail", cells.getCell(book, false));
                });
            });
        }
    };

    Detail.prototype.save = function () {
        const diff = _.omit(_.diff(this.detailBook, this.cell.book), ["src", "palette"]);
        if (!_.isEmpty(diff)) {
            req(`/detail/${this.cell.book.id}`, "PUT").send(diff).then(() => {
                this.cell.update(this.detailBook, true).defLoad();
                if (_.has(diff, "tags")) {
                    em.emit("updateTag", {
                        "id": this.cell.id,
                        "tags": diff.tags
                    });
                }
            }).catch((error) => err.add(error));
        }
        this.close();
        return this;
    };

    Detail.prototype.add = function () {
        this.cell.add();
        detail.many("#detailAdd, #detailSave, #detailRecommand, .inCollection").toggleClass("notdisplayed");
        return this;
    };
    Detail.prototype.googleLink = function () {
        window.open(this.detailBook.link);
        return this;
    };
    Detail.prototype.connex = function () {
        this.close();
        em.emit("associated", this.cell.book.id);
        return this;
    };
    Detail.prototype.preview = function () {
        µ.one(".waiting").toggleClass("over", true);
        previewWindow.one("iframe").set("src", "about:blank");
        previewWindow.openOver();
        detail.one("form[target=preview]").trigger("submit");
    };
    Detail.prototype.recommand = function () {
        _.noop();
        return this;
    };
    Detail.prototype.addTag = function (result) {
        if (!_.includes(this.detailBook.tags, result.tag)) {
            const tags = detail.one(".tags"),
                tag = µ.new("div").toggleClass("tag").set("innerHTML", renderTag(result));

            tag.one("button:not(.libelle)").observe("click", (event) => {
                this.removeTag(event.element);
            });

            tags.append(_.sortBy(_.concat(detail.many(".tags .tag").elements, [tag]), [(tag) => tag.one(".libelle").text])).toggleClass("notdisplayed", false);
            this.detailBook.tags = _.concat(this.detailBook.tags, [result.tag]);
            this.detailBook.tags.sort();
        }
        return this;
    };
    Detail.prototype.byTag = function (tag) {
        this.close();
        if (!µ.one("#collection").hasClass("active")) {
            em.emit("showCollection");
        }
        em.emit("filtreTag", tag);
        return this;
    };
    Detail.prototype.removeTag = function (elt) {
        const tag = elt.siblings.get(0).text;
        if (tag) {
            this.detailBook.tags = _.without(this.detailBook.tags, tag);
            elt.parent.remove();
        }
        return this;
    };

    previewWindow.one("#closePreview").observe("click", () => {
        µ.one(".waiting").toggleClass("over", false);
        previewWindow.closeOver();
    });

    return new Detail();
});
