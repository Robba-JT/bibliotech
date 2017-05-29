"use strict";

define("detail", ["Window", "hdb", "text!../templates/detail", "text!../templates/newDetail", "text!../templates/Tag", "text!../templates/MostAdded", "text!../templates/preview", "text!../templates/context", "text!../templates/recommand"], function (Window, hdb, tempDetail, tempNewDetail, tempTag, tempAdded, tempPreview, tempContext, tempRecommand) {
    var renderDetail = hdb.compile(tempDetail),
        renderNewDetail = hdb.compile(tempNewDetail),
        renderTag = hdb.compile(tempTag),
        renderAdded = hdb.compile(tempAdded),
        renderContext = hdb.compile(tempContext),
        recommand = new Window("recommand", tempRecommand),
        thief = new ColorThief(),
        detail = µ.one("detail"),
        Detail = function Detail() {
        var _this = this;

        em.on("openDetail", this, function (cell) {
            µ.one(".waiting").toggleClass("notdisplayed", false);
            µ.one("html").toggleClass("overflown", true);
            if (_.isPlainObject(cell.book.id) && _.isUndefined(cell.book.id.number)) {
                _this.empty(cell);
            } else if (cell.book.detailed || cell.book.inCollection) {
                _this.init(cell);
            } else {
                var storeDetail = store.get(cell.id);
                if (storeDetail) {
                    _.assign(cell.book, storeDetail);
                    _this.init(cell);
                } else {
                    req("/detail/" + cell.id).send().then(function (result) {
                        _.assign(cell.book, result, {
                            "detailed": true
                        });
                        store.set(cell.id, cell.book);
                        _this.init(cell);
                    }).catch(function (error) {
                        err.add(error);
                    });
                }
            }
        });
    },
        context = µ.one("context"),
        preview = new Window("preview", tempPreview);

    Detail.prototype.add = function () {
        this.cell.add();
        µ.many("#detailAdd, #detailSave, #detailRecommand, #contextAdd, #contextSave, #contextRecommand, detail .inCollection").toggleClass("notdisplayed");
        return this;
    };

    Detail.prototype.addTag = function (result) {
        var _this2 = this;

        if (!_.includes(this.detailBook.tags, result.tag)) {
            var tags = detail.one(".tags"),
                tag = µ.new("div").toggleClass("tag").set("innerHTML", renderTag(result));

            tag.one("button:not(.libelle)").observe("click", function (event) {
                _this2.removeTag(event.element);
            });

            tags.append(_.sortBy(_.concat(detail.many(".tags .tag").elements, [tag]), [function (tag) {
                return tag.one(".libelle").text;
            }])).toggleClass("notdisplayed", false);
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

    Detail.prototype.close = function () {
        context.toggleClass("notdisplayed", true);
        detail.toggleClass("notdisplayed", true);
        µ.one(".waiting").toggleClass("notdisplayed", true);
        µ.one("html").toggleClass("overflown", false);
        detail.set("innerHTML", "");
        return this;
    };

    Detail.prototype.connex = function () {
        this.close();
        em.emit("associated", this.cell.id);
        return this;
    };

    Detail.prototype.create = function () {
        var _this3 = this;

        var newBook = detail.one("form[name=newBook]").parser();
        detail.one("form[name=newBook]").reset();
        req("detail", "POST").send(newBook).then(function (id) {
            _.assign(newBook, {
                id: id
            });
            _this3.cell.id = JSON.stringify(id);
            _this3.cell.add();
            detail.set("innerHTML", renderNewDetail(_.assign(_this3.detailBook, newBook, {
                "inCollection": true
            })));
            _this3.setEvents();
        }).catch(function (error) {
            return err.add(error);
        });
        return this;
    };

    Detail.prototype.empty = function (cell) {
        var _this4 = this;

        this.cell = cell;
        this.detailBook = {
            "note": 0,
            "tags": [],
            "comment": ""
        };
        detail.set("innerHTML", renderNewDetail());
        this.setEvents();
        detail.many("button.title").toggleClass("hide", true);
        detail.many(".volumeInfo input, .volumeInfo textarea, .volumeInfo span").toggleClass("notdisplayed");
        µ.many("#detailAdd, #contextAdd").observe("click", function () {
            return _this4.create();
        });
        detail.one("[focus]").focus();
    };

    Detail.prototype.googleLink = function () {
        window.open(this.detailBook.link);
        return this;
    };

    Detail.prototype.init = function (cell) {
        var _this5 = this;

        req("/mostAdded/" + cell.id).send().then(function (result) {
            return _this5.mostAdded(result);
        }).catch(function (error) {
            return err.add(error);
        });
        this.cell = cell;
        this.detailBook = _.assign({
            "note": 0,
            "tags": [],
            "comment": ""
        }, this.cell.book);

        recommand.one("[name=book]").value = this.cell.id;

        if (_.isPlainObject(cell.book.id)) {
            detail.set("innerHTML", renderNewDetail(_.merge(this.detailBook, {
                "src": this.cell.src
            })));
        } else {
            detail.set("innerHTML", renderDetail(_.merge(this.detailBook, {
                "src": this.cell.src
            })));
        }
        context.set("innerHTML", renderContext(_.merge(this.detailBook, {
            "src": this.cell.src
        }))).many("[nav]").observe("click", function (event) {
            var move = event.element.get("nav"),
                visibles = µ.many("cell:not(.notdisplayed)"),
                perLine = ~~(µ.one("bookcells").get("clientWidth") / _this5.cell.cell.get("clientWidth"));

            var index = visibles.indexOf("[book='" + _this5.cell.id + "']");

            if (index === -1) {
                return false;
            }
            switch (move) {
                case "right":
                    index += 1;
                    if (index >= visibles.length) {
                        return false;
                    }
                    break;
                case "left":
                    if (index === 0) {
                        return false;
                    }
                    index -= 1;
                    break;
                case "top":
                    if (index < perLine) {
                        return false;
                    }
                    index -= perLine;
                    break;
                case "bottom":
                    index += perLine;
                    if (index >= visibles.length) {
                        return false;
                    }
                    break;
                default:
            }
            setTimeout(function () {
                var next = visibles.get(index);
                window.scrollTo(0, next.get("offsetTop"));
                next.trigger("click");
            });
            return true;
        });
        this.setEvents();
        µ.many("#detailAdd, #contextAdd").observe("click", function () {
            return _this5.add();
        });
    };

    Detail.prototype.mostAdded = function (books) {
        if (books.length) {
            var mostAdded = detail.one("#mostAdded"),
                divMostAdded = mostAdded.one("div");

            mostAdded.many("*").toggleClass("notdisplayed", false);
            _.forEach(books, function (book) {
                var cell = µ.new("div").toggleClass("mostAdded").set("innerHTML", renderAdded(book)).appendTo(divMostAdded);
                if (book.description) {
                    var limit = 200,
                        index = _.get(book, "description").indexOf(" ", limit);

                    cell.one("span").html = _.get(book, "description").substr(0, Math.max(limit, index)) + (index === -1 ? "" : "...");
                    cell.one("span").observe("click", function (event) {
                        event.stopPropagation();
                        event.element.toggleClass("notdisplayed", true);
                    });
                    cell.observe("mouseleave", function () {
                        cell.one("span").toggleClass("notdisplayed", false);
                    });
                }
                if (book.cover) {
                    var img = cell.one("img");
                    book.src = "/cover/" + book.id + "?" + Math.random().toString(24).slice(2);
                    img.loaded = function () {
                        cell.one(".altCover").remove();
                        img.toggleClass("notdisplayed", false);
                    };
                    img.set("src", book.src);
                }
                cell.observe("click", function () {
                    em.emit("openDetail", em.emit("getCell", book, false));
                });
            });
        }
    };

    Detail.prototype.preview = function () {
        context.toggleClass("notdisplayed", true);
        preview.one("iframe").set("src", "about:blank");
        preview.openOver();
        detail.one("form[target=preview]").trigger("submit");
    };

    recommand.one("#closeRecommand").observe("click", function () {
        recommand.closeOver();
        recommand.one("form").reset();
    });
    recommand.one("[type=email]").observe("change", function (event) {
        event.element.valid = event.element.value !== em.emit("getUser");
    });
    recommand.one("form").observe("submit", function (event) {
        event.preventDefault();
        req("notifications", "POST").send(event.element.parser()).catch(function (error) {
            return err.add(error);
        });
        event.element.reset();
        recommand.closeOver();
        return false;
    });
    Detail.prototype.recommand = function () {
        context.toggleClass("notdisplayed", true);
        recommand.openOver();
        return this;
    };

    Detail.prototype.removeTag = function (elt) {
        var tag = elt.siblings.get(0).text;
        if (tag) {
            this.detailBook.tags = _.without(this.detailBook.tags, tag);
            elt.parent.remove();
        }
        return this;
    };

    Detail.prototype.save = function () {
        var _this6 = this;

        var diff = _.omit(_.diff(this.detailBook, this.cell.book), ["src", "palette"]);
        if (!_.isEmpty(diff)) {
            req("/detail/" + this.cell.id, "PUT").send(diff).then(function () {
                _this6.cell.update(_this6.detailBook, true);
                if (_.has(_this6.cell, "defLoad")) {
                    _this6.cell.defLoad();
                }
                if (_.has(diff, "tags")) {
                    em.emit("updateTag", {
                        "id": _this6.cell.id,
                        "tags": diff.tags
                    });
                }
            }).catch(function (error) {
                return err.add(error);
            });
        }
        this.close();
        return this;
    };

    Detail.prototype.setEvents = function () {
        var _this7 = this;

        µ.many("detail .closeWindow, context #contextClose").observe("click", function () {
            return _this7.close();
        });
        µ.many("#detailSave, #contextSave").observe("click", function () {
            return _this7.save();
        });
        µ.many("#detailGbooks, #contextGbooks").observe("click", function () {
            return _this7.googleLink();
        });
        µ.many("#detailConnex, #contextConnex").observe("click", function () {
            return _this7.connex();
        });
        µ.many("#detailPreview, #contextPreview").observe("click", function () {
            return _this7.preview();
        });
        µ.many("#detailRecommand, #contextRecommand").observe("click", function () {
            return _this7.recommand();
        });
        detail.toggleClass("notdisplayed", false);
        detail.one("form[name=formTag]").observe("submit", function (event) {
            event.preventDefault();
            _this7.addTag(event.element.parser());
            event.element.reset();
        });
        if (this.detailBook.inCollection) {
            detail.many(".inCollection").toggleClass("notdisplayed", false);
        }
        if (this.detailBook.note) {
            var notes = detail.many(".note");
            notes.length = this.detailBook.note;
            notes.toggleClass("empty select");
        }
        detail.css("background", "radial-gradient(circle at 50%, whitesmoke 0%, #909090 100%)");
        detail.many(".note").observe("mouseenter", function (event) {
            var value = _.parseInt(event.element.get("note")),
                note = _this7.detailBook.note,
                notes = detail.many(".note");

            notes.each(function (elt, index) {
                elt.toggleClass("plus", index >= note && index < value).toggleClass("minus", index < note && index >= value);
            });
        }).observe("mouseleave", function () {
            detail.many(".note").each(function (elt) {
                elt.toggleClass("plus minus", false);
            });
        }).observe("click", function (event) {
            var thisNote = _.parseInt(event.element.get("note"));
            if (_this7.detailBook.note === 1 && thisNote === 1) {
                _this7.detailBook.note = 0;
            } else {
                _this7.detailBook.note = thisNote;
            }
            detail.many(".note").each(function (elt, index) {
                elt.toggleClass("empty", index >= _this7.detailBook.note).toggleClass("select", index < _this7.detailBook.note);
            });
        });
        detail.one("[name=userComment]").observe("change", function (event) {
            _this7.detailBook.comment = event.element.value;
            _this7.detailBook.date = event.element.value ? new Date() : null;
        });
        detail.one("#detailCover").observe("load", function () {
            _this7.detailBook.palette = thief.getPalette(detail.one("#detailCover").element);
            if (_this7.detailBook.palette && _this7.detailBook.palette.length) {
                detail.css("background", "radial-gradient(circle at 50%, whitesmoke 0%," + µ.rgbToHex(_this7.detailBook.palette[0]) + " 100%)");
            }
        });
        detail.one("div.upload").observe("click", function () {
            return detail.one("[type=file]").trigger("click");
        });
        detail.one("[type=file]").observe("change", function (event) {
            detail.many("#noCover").toggleClass("notdisplayed", event.element.files.length);
            if (event.element.files.length) {
                var reader = new FileReader();
                reader.addEventListener("load", function (result) {
                    detail.one("#detailCover").toggleClass("notdisplayed", false).set("src", result.target.result);
                    _this7.detailBook.alt = result.target.result;
                });
                reader.readAsDataURL(event.element.files[0]);
                detail.one("form[name=uploadImg]").reset();
            }
        });
        detail.one("datalist").html = em.emit("getCloudOptions").join("");
        detail.many("[searchby]").observe("click", function (event) {
            _this7.close();
            em.emit("search", {
                "by": event.element.get("searchby"),
                "search": event.element.text,
                "lang": document.body.lang
            });
        });
        detail.many(".tag button").observe("click", function (event) {
            if (event.element.hasClass("libelle")) {
                _this7.byTag(event.element.text);
            } else {
                _this7.removeTag(event.element);
            }
        });
        detail.one("[name=newBook]").observe("submit", function (event) {
            return event.preventDefault();
        });
        detail.many(".volumeInfo input, .volumeInfo textarea").observe("blur", function (event) {
            event.element.value = "" + event.element.value.substr(0, 1).toUpperCase() + event.element.value.substr(1);
            _.set(_this7.detailBook, "volumeInfo." + event.element.name, event.element.value);
        });
        detail.many("button.title").observe("click", function (event) {
            event.element.toggleClass("hide");
            event.element.parent.many("input, textarea").toggleClass("notdisplayed");
        });
        em.on("resize", this, this.close);
        em.on("closeAll", this, this.close);
    };

    preview.one("#closePreview").observe("click", function () {
        return preview.closeOver();
    });

    detail.observe("contextmenu", function (event) {
        event.preventDefault();
        var thisHeight = context.toggleClass("notdisplayed", false).get("clientHeight"),
            thisWidth = context.get("clientWidth"),
            eventX = event.clientX,
            eventY = event.clientY;
        context.css({
            "top": eventY + thisHeight > window.innerHeight ? eventY - thisHeight : eventY,
            "left": eventX + thisWidth > window.innerWidth ? eventX - thisWidth : eventX
        });
        return false;
    });
    detail.observe("click", function () {
        return context.toggleClass("notdisplayed", true);
    });

    return new Detail();
});
