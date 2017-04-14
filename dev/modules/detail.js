define("detail", ["Window", "hdb", "cloud", "text!../templates/detail", "text!../templates/Tag", "text!../templates/MostAdded"], function (Window, hdb, cloud, tempDetail, tempTag, tempAdded) {
    const renderDetail = hdb.compile(tempDetail),
        renderTag = hdb.compile(tempTag),
        renderAdded = hdb.compile(tempAdded),
        thief = new ColorThief(),
        detail = µ.one("detail"),
        Detail = function () {
            em.on("openDetail", this, (book) => {
                this.open(book);
            });
        };

    Detail.prototype.init = function (cell) {
        this.cell = cell;
        this.cloneBook = _.assign({
            "note": 0,
            "tags": [],
            "comment": ""
        }, this.cell.book);

        detail.set("innerHTML", renderDetail(_.merge(this.cloneBook, {
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
        if (this.cloneBook.inCollection) {
            detail.many(".inCollection").toggleClass("notdisplayed", false);
        }
        if (this.cloneBook.note) {
            const notes = detail.many(".note");
            notes.length = this.cloneBook.note;
            notes.toggleClass("empty select");
        }
        detail.css("background", "radial-gradient(circle at 50%, whitesmoke 0%, #909090 100%)");
        detail.many(".note").observe("mouseenter", (event) => {
            const value = _.parseInt(event.element.get("note")),
                note = this.cloneBook.note || 0,
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
            if (this.cloneBook.note === 1 && thisNote === 1) {
                this.cloneBook.note = 0;
            } else {
                this.cloneBook.note = thisNote;
            }
            detail.many(".note").each((elt, index) => {
                elt.toggleClass("empty", index >= this.cloneBook.note).toggleClass("select", index < this.cloneBook.note);
            });
        });
        detail.one("[name=userComment]").observe("change", (event) => {
            this.cloneBook.comment = event.element.value;
            this.cloneBook.date = event.element.value ? new Date() : null;
        });
        detail.one("#detailCover").observe("load", () => {
            this.cloneBook.palette = thief.getPalette(detail.one("#detailCover").element);
            if (this.cloneBook.palette && this.cloneBook.palette.length) {
                detail.css("background", `radial-gradient(circle at 50%, whitesmoke 0%,${µ.rgbToHex(this.cloneBook.palette[0])} 100%)`);
            }
        });
        detail.one("div.upload").observe("click", () => detail.one("[type=file]").trigger("click"));
        detail.one("[type=file]").observe("change", (event) => {
            detail.many("#noCover").toggleClass("notdisplayed", event.element.files.length);
            if (event.element.files.length) {
                const reader = new FileReader();
                reader.addEventListener("load", (result) => {
                    detail.one("#detailCover").toggleClass("notdisplayed", false).set("src", result.target.result);
                    this.cloneBook.alt = result.target.result;
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

    Detail.prototype.save = function () {
        const diff = _.diff(this.cloneBook, this.cell.book);
        if (!_.isEmpty(diff)) {
            req(`/detail/${this.cell.book.id}`, "PUT").send(diff).then(() => {
                this.cell.update(this.cloneBook, true).defLoad();
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
        window.open(this.cloneBook.link);
        return this;
    };
    Detail.prototype.connex = function () {
        this.close();
        em.emit("associated", this.cell.book.id);
        return this;
    };
    Detail.prototype.preview = function () {
        _.noop();
        return this;
    };
    Detail.prototype.recommand = function () {
        _.noop();
        return this;
    };
    Detail.prototype.addTag = function (result) {
        if (!_.includes(this.cloneBook.tags, result.tag)) {
            const tags = detail.one(".tags"),
                tag = µ.new("div").toggleClass("tag").set("innerHTML", renderTag(result));

            tag.many("button").observe("click", (event) => {
                alert(event.element.hasClass("libelle") ? event.element.text : "remove");
            });

            tags.append(_.sortBy(_.concat(detail.many(".tags .tag").elements, [tag]), [(tag) => tag.text])).toggleClass("notdisplayed", false);
            this.cloneBook.tags = _.concat(this.cloneBook.tags, [result.tag]);
            this.cloneBook.tags.sort();
        }
        return this;
    };
    Detail.prototype.removeTag = function () {
        //
    };

    return new Detail();
});
