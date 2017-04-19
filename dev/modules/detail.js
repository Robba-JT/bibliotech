define("detail", ["Window", "hdb", "cloud", "cells", "text!../templates/detail", "text!../templates/Tag", "text!../templates/MostAdded", "text!../templates/Preview"], function (Window, hdb, cloud, cells, tempDetail, tempTag, tempAdded, tempPreview) {
    const renderDetail = hdb.compile(tempDetail),
        renderTag = hdb.compile(tempTag),
        renderAdded = hdb.compile(tempAdded),
        thief = new ColorThief(),
        detail = µ.one("detail"),
        Detail = function () {
            em.on("openDetail", this, (book) => {
                this.open(book);
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
        em.on("resize", this, this.close);
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
                    req(`/detail/${book.id}`).send().then((result) => {
                        _.assign(book, result, {
                            "detailed": true
                        });
                        em.emit("openDetail", cells.getCell(book, false));
                    }).catch((error) => {
                        err.add(error);
                    });
                });
            });
        }
    };

    Detail.prototype.save = function () {
        const diff = _.diff(this.detailBook, this.cell.book);
        if (!_.isEmpty(diff)) {
            req(`/detail/${this.cell.book.id}`, "PUT").send(_.omit(diff, ["src", "palette"])).then(() => {
                this.cell.update(this.detailBook, true).defLoad();
                this.close();
            }).catch((error) => err.add(error));
        }
        return this;
    };
    Detail.prototype.add = function () {
        em.emit("addBook", this.cell);
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

            tag.many("button").observe("click", (event) => {
                alert(event.element.hasClass("libelle") ? event.element.text : "remove");
            });

            tags.append(_.sortBy(_.concat(detail.many(".tags .tag").elements, [tag]), [(tag) => tag.text])).toggleClass("notdisplayed", false);
            this.detailBook.tags = _.concat(this.detailBook.tags, [result.tag]);
            this.detailBook.tags.sort();
        }
        return this;
    };
    Detail.prototype.removeTag = function () {
        //
    };

    previewWindow.one("#closePreview").observe("click", () => {
        µ.one(".waiting").toggleClass("over", false);
        previewWindow.closeOver();
    });

    return new Detail();
});
