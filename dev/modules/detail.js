define("detail", ["Window", "hdb", "text!../templates/detail", "text!../templates/Tag", "text!../templates/MostAdded"], function (Window, hdb, tempDetail, tempTag, tempAdded) {
    const renderDetail = hdb.compile(tempDetail),
        renderTag = hdb.compile(tempTag),
        renderAdded = hdb.compile(tempAdded),
        detail = µ.one("detail"),
        Detail = function () {
            em.on("openDetail", this, (book) => {
                this.open(book);
            });
        };

    Detail.prototype.init = function (book) {
        this.book = book;
        this.cloneBook = _.assign({
            "note": 0,
            "tags": [],
            "comment": ""
        }, this.book);

        detail.set("innerHTML", renderDetail(_.assign({}, this.cloneBook, {
            "source": _.get(this.cloneBook, "cover") ? `/cover/${this.cloneBook.id}` : "",
            "alt": _.get(this.cloneBook, "cover") ? " notdisplayed" : "",
            "hasComment": _.get(this.cloneBook, "date") ? "" : " notdisplayed"
        })));
        detail.one("[description]").html = book.description;
        detail.one(".closeWindow").observe("click", () => {
            this.close();
        });
        detail.one("#detailSave").toggleClass("notdisplayed", !book.inCollection).observe("click", () => this.save());
        detail.one("#detailAdd").toggleClass("notdisplayed", book.inCollection).observe("click", () => this.add());
        detail.one("#detailGbooks").toggleClass("notdisplayed", !book.link).observe("click", () => this.googleLink());
        detail.one("#detailConnex").toggleClass("notdisplayed", _.isPlainObject(book.id)).observe("click", () => this.connex());
        detail.one("#detailPreview").toggleClass("notdisplayed", !book.preview).observe("click", () => this.preview());
        detail.one("#detailRecommand").toggleClass("notdisplayed", !book.inCollection).observe("click", () => this.recommand());
        detail.css({
            "top": `${document.body.scrollTop}px`
        }).toggleClass("notdisplayed", false);
        if (this.cloneBook.palette && this.cloneBook.palette.length) {
            detail.css("background", `radial-gradient(circle at 50%, whitesmoke 0%,${µ.rgbToHex(this.cloneBook.palette[0])} 100%)`);
        } else {
            detail.css("background", "radial-gradient(circle at 50%, whitesmoke 0%, #909090 100%)");
        }
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
    };

    Detail.prototype.open = function (book) {
        µ.one(".waiting").toggleClass("notdisplayed", false);
        µ.one("html").toggleClass("overflown", true);
        this.init(book);
    };

    Detail.prototype.close = function () {
        detail.toggleClass("notdisplayed", true);
        µ.one(".waiting").toggleClass("notdisplayed", true);
        µ.one("html").toggleClass("overflown", false);
    };

    Detail.prototype.save = function () {
        const diff = _.diff(this.cloneBook, this.book);
        if (!_.isEmpty(diff)) {
            req(`/detail/${this.book.id}`, "PUT").send(diff).catch((error) => err.add(error));
        }
        _.assign(this.book, this.cloneBook);
        this.close();
    };
    Detail.prototype.add = function () {
        _.noop();
    };
    Detail.prototype.googleLink = function () {
        window.open(this.cloneBook.link);
    };
    Detail.prototype.connex = function () {
        _.noop();
    };
    Detail.prototype.preview = function () {
        _.noop();
    };
    Detail.prototype.recommand = function () {
        _.noop();
    };
    Detail.prototype.addTag = function (result) {
        if (!_.includes(this.cloneBook.tags, result.tag)) {
            const tags = detail.one(".tags");
            tags.html += renderTag(result);
            tags.append(_.sortBy(detail.many(".tags .tag").elements, [(tag) => tag.text])).toggleClass("notdisplayed", false);
            this.cloneBook.tags = _.concat(this.cloneBook.tags, [result.tag]);
            this.cloneBook.tags.sort();
        }
    };

    hdb.registerHelper("formatDate", function (date, lang) {
        const options = {
            "year": "numeric",
            "month": "long",
            "day": "numeric"
        };
        return new Date(date || new Date()).toLocaleDateString(lang || "fr", options);
    });

    hdb.registerHelper("eachAuthors", function (authors) {
        return _.trim(authors).split(",");
    });

    return new Detail();
});
