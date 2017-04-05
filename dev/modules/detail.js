define("detail", ["Window", "hdb", "text!../templates/detail", "text!../templates/tag"], function (Window, hdb, tempDetail, tempTag) {
    const renderDetail = hdb.compile(tempDetail),
        renderTag = hdb.compile(tempTag),
        detail = µ.one("detail"),
        Detail = function () {
            em.on("openDetail", this, (book) => {
                this.open(book);
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

    Detail.prototype.init = function (book) {
        this.book = book;
        detail.set("innerHTML", renderDetail(_.assign(book, {
            "source": _.get(book, "cover") ? `/cover/${book.id}` : "",
            "alt": _.get(book, "cover") ? " notdisplayed" : "",
            "authors": book.authors.split(",")
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
        if (this.book.palette && this.book.palette.length) {
            detail.css("background", `radial-gradient(circle at 50%, whitesmoke 0%,${µ.rgbToHex(this.book.palette[0])} 100%)`);
        } else {
            detail.css("background", "radial-gradient(circle at 50%, whitesmoke 0%, #909090 100%)");
        }
        detail.one("form[name=formTag]").observe("submit", (event) => {
            event.preventDefault();
            this.addTag(event.element.parser());
            event.element.reset();
        });
        if (this.book.inCollection) {
            detail.many(".inCollection").toggleClass("notdisplayed", false);
        }
        if (this.book.note) {
            const notes = detail.many(".note");
            notes.length = this.book.note;
            notes.toggleClass("empty select");
        }
    };

    Detail.prototype.save = function () {
        _.noop();
    };
    Detail.prototype.add = function () {
        _.noop();
    };
    Detail.prototype.googleLink = function () {
        window.open(this.book.link);
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
        if (!_.includes(this.book.tags, result.tag)) {
            detail.one(".tags").toggleClass("notdisplayed", false).html += renderTag(result);
            _.forEach(_.sortBy(detail.many(".tags .tag").elements, [(tag) => tag.text]), (elt) => {
                detail.one(".tags").append(elt);
            });
            this.book.tags.push(result.tag);
            this.book.tags.sort();
        }
    }

    return new Detail();
});
