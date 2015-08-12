if (!window.FileReader || !window.Promise || !("formNoValidate" in document.createElement("input"))) {
    alert(document.body.getAttribute("error"));
} else {
    var µ = document, current;
    µ.setEvents("DOMContentLoaded", function () {
        "use strict";
        var start = new Date();
        console.debug("µ.ready", start.toLocaleString());
        var Bookcell = function (book, indice) {
                var totalCells = Bookcells.cells.length + (typeof indice === "undefined" ? 1 : indice),
                    inCollect = µ.one("#collection").hasClass("active") || User.get().bookindex(book.id) !== -1;

                this.id = book.id;
                this.book = book;
                this.cell = µ.one("#tempCell").cloneNode(true).removeAttributes("id").toggleClass("bookcell", true);
                this.cell.one("header").text(book.title);
                this.cell.one("figcaption").text(!!book.authors ? book.authors.join(", ") : "");
                this.cell.one(".previewable").toggle(!!book.access && book.access !== "NONE");
                this.cell.one(".recommanded").toggle(!!book.from);
                this.cell.one(".personnal").toggle(_.isEqual(book.id.user, User.get().id));
                this.cell.one(".add").toggle(!inCollect);
                this.cell.one(".remove").toggle(!!inCollect);
                this.cell.col = totalCells % Dock.nbcols;
                this.cell.row = Math.floor(totalCells / Dock.nbcols);
                if (!!book.alternative || !!book.base64) { this.cell.one(".cover").src = book.alternative || book.base64; }
                this.active();
                return this;
            },
            Bookcells = {
                books: [],
                bytags: function (tag) {
                    if (!µ.one("#collection").hasClass("active")) { return; }
                    window.scroll(0, 0);
                    µ.one("#formFilter").reset();
                    µ.alls(".bookcell").toggleClass("tofilter", false);
                    //µ.one("#selectedTag").html(tag);
                    for (var jta = 0, lg = Bookcells.cells.length; jta < lg; jta++) {
                        var bcell = Bookcells.cells[jta];
                        bcell.cell.toggleClass("tohide", !_.includes(bcell.book.tags, tag));
                    }
                    Bookcells.display();
                },
                cells: [],
                destroy: function () {
                    Dock.remove(); Bookcells.books = []; Bookcells.cells = [];
                },
                display: function (cells, filter, from) {
                    var args = [filter, from];
                    return new Promise(function (resolve) {
                        if (!cells && !!µ.one(".sortBy")) { resolve(Bookcells.sort.call(µ.one(".sortBy"), args)); } else {
                            cells = cells || _.sortBy(Bookcells.cells, function (cell) { return [ cell.row, cell.col ]; });
                            var indice = 0, $dock = Dock.get();
                            for (var jta = 0, lg = cells.length; jta < lg; jta++) {
                                var bcell = cells[jta], cell = cells[jta].cell;
                                if (!!from) { cell.toggleClass("tohide tofilter", false); }
                                if (!!cell.hasClass("tohide") || !!cell.hasClass("tofilter")) { Dock.get().one("section.notdisplayed").appendChild(cell); } else {
                                    cell.toggleClass("toshow", true);
                                    $dock.one("[colid=\""+ ((!!filter) ? cell.col : indice % Dock.nbcols) +"\"]").appendChild(cell);
                                    indice++;
                                }
                            }
                            Waiting.toggle(false);
                            Bookcells.loadcovers();
                            resolve(Bookcells.cells.length);
                        }
                    });
                },
                filter: function () {
                    var filtre = this.value.toLowerCase(), last = µ.one("@last");
                    µ.one(".tnv").trigger("click");
                    if (!!this.checkValidity() && filtre !== last.value) {
                        last.value = filtre;
                        for (var jta = 0, lg = Bookcells.cells.length; jta < lg; jta++) {
                            var cell = Bookcells.cells[jta],
                                title = cell.book.title.toLowerCase(),
                                subtitle = (!!cell.book.subtitle) ? cell.book.subtitle.toLowerCase() : "",
                                authors = (!!cell.book.authors) ? cell.book.authors.join(", ").toLowerCase() : "",
                                description = cell.book.description.toLowerCase();

                            cell.cell.toggleClass("tofilter", title.indexOf(filtre) === -1 && subtitle.indexOf(filtre) === -1 && authors.indexOf(filtre) === -1 && description.indexOf(filtre) === -1);
                        }
                        Bookcells.display();
                    }
                },
                generate: function (books) {
                    return new Promise(function (resolve) {
                        var newCells = [], indice = 0;
                        for (var jta = 0, lg = books.length; jta < lg; jta++) {
                            if (!!Bookcells.one(books[jta].id) || _.findIndex(newCells, _.matchesProperty("id", books[jta].id)) !== -1) { continue; }
                            newCells.push(new Bookcell(User.get().book(books[jta].id) || books[jta], jta));
                        }
                        Bookcells.cells.assign(newCells);
                        if (!µ.one("#collection").hasClass("active") && !!Search.last) {
                            Bookcells.books.push(books);
                            Bookcells.books = _.flatten(Bookcells.books);
                        }
                        resolve(newCells);
                    });
                },
                loadcovers: function () {
                    for (var jta = 0, lg = Bookcells.cells.length; jta < lg; jta++) { Bookcells.cells[jta].loadcover(); }
                    Menu.toggleFooter();
                    return;
                },
                one: function (bookid) { return _.find(Bookcells.cells, _.matchesProperty("id", bookid)); },
                returned: function (book) { Bookcells.one(book.id).returned(book); },
                show: function (books) {
                    var bArray = _.chunk(books, 40), chain,
                        gen = function (books) {
                            return new Promise(function (resolve) {
                                Bookcells.generate(books).then(function (cells) { Bookcells.display(cells, true); }).then(resolve);
                            });
                        };

                    for (var jta = 0, lg = bArray.length; jta < lg; jta++) {
                        chain = !!chain ? chain.then(gen(bArray[jta])) : chain = gen(bArray[jta]);
                    }
                    return chain;
                },
                sort: function () {
                    var args = arguments[0] || [];
                    window.scroll(0, 0);
                    if (this.hasClass("active")) { return; }
                    var self = this;
                    if (!!µ.one(".sortBy")) { Images.blur.call(µ.one(".sortBy").toggleClass("sortBy", false)); }
                    Images.hover.call(this).toggleClass("sortBy", true);
                    Bookcells.display(_.sortByOrder(Bookcells.cells, ["book." + [self.getAttribute("by")]] , self.getAttribute("sort") !== "desc"), args[0] || false, args[1] || false);
                }
            },
            checkValid = function () {
                var n;
                this.setCustomValidity("");
                switch (this.name) {
                case "confirmPwd":
                    n = (this.value !== µ.one("@newPwd").value);
                    break;
                case "filtre":
                    n = (!!this.value.length && this.value.length < 3);
                    break;
                case "name":
                    n = (this.value.length < 4);
                    break;
                case "newPwd":
                    n = (this.value.length < 4 || this.value.length > 12);
                    break;
                case "pwd":
                    n = (this.value.length < 4 || this.value.length > 12);
                    break;
                case "recommand":
                    n = (this.value.toLowerCase() === User.get().id);
                    break;
                case "searchinput":
                    n = (this.value.length < 3);
                    break;
                case "title":
                    n = (this.value.length < 6);
                    break;
                }
                if (!!n) { this.setCustomValidity(this.getAttribute("error")); }
                return;
            },
            colorthief = new ColorThief(),
            Detail = {
                action: function () {
                    var bookid = Detail.data.book.id, book = User.get().book(bookid), actclick = this.getAttribute("actclick");
                    this.add = function () {
                        if (!bookid) {
                            var newbook = µ.one("#formNew").formToJson(), error, inputs = µ.alls("#formNew input, #formNew textarea");
                            for (var jta = 0, lg = inputs.length; jta < lg; jta++) { if (!inputs[jta].reportValidity()) { error = true; break; }}
                            newbook.authors = !!newbook.authors ? newbook.authors.split(",") : [];
                            //for (jta = 0, lg = newbook.authors.length; jta < lg; jta++) { newbook.authors[jta] = newbook.authors[jta].noSpace(); }
                            newbook.authors.noSpace();
                            if (!!error) { return false; }
                            Waiting.over();
                            socket.emit("newbook", newbook);
                        } else {
                            socket.emit("addDetail");
                            µ.alls("[actclick=\"upload\"]").toggle(!Detail.data.book.cover);
                            Detail.newCell();
                        }
                    };
                    this.associated = function () {
                        Search.associated(bookid);
                    };
                    this.update = function () {
                        var update = false,
                            values = { id: bookid },
                            tags = _.map(µ.alls("#userTags > div").toArray(), function (tag) { return tag.one(".libelle").text(); }),
                            note = µ.one("#userNote").value,
                            comment = µ.one("#userComment").value;
                            //mainColor = µ.one("#detailCover").getAttribute("mainColor"),
                            //alternative = µ.one("#detailCover").getAttribute("src") !== images["book-4-icon"].black ? µ.one("#detailCover").getAttribute("src") : null;

                        if (_.isObject(bookid) && bookid.user === User.get().id) {
                            var formValues = µ.one("#formNew").formToJson();
                            formValues.authors = formValues.authors.split(",") || [];
                            _.forEach(formValues, function (val, key) {
                                val = val.noSpace();
                                if (!_.isEqual(book[key], val)) {
                                    update = true;
                                    if (!values.update) { values.update = {}; }
                                    values.update[key] = val;
                                }
                            });
                        }
                        if ((!!note || !!book.userNote) && note !== book.userNote) { update = true; values.userNote = note; }
                        if ((!!comment || !!book.userComment) && comment !== book.userComment) {
                            update = true;
                            values.userComment = comment;
                        }
                        if ((!!tags.length || !!book.tags && !!book.tags.length) && !_.isEqual(tags, book.tags)) {
                            update = "tags";
                            values.tags = tags;
                        }
                        /*if (!!mainColor && book.alternative !== alternative) {
                            update = true;
                            values.alternative = alternative;
                            values.mainColor = mainColor;
                        }*/
                        if (!!update) {
                            values.userDate = new Date().toJSON();
                            socket.emit("updateBook", values);
                            User.get().updatebook(values);
                            Tags.init();
                            µ.one("#tags").toggle(!!Tags.cloud.length && µ.one("#collection").hasClass("active"));
                        }
                        Windows.close();
                    };
                    this.upload = function () {
                        µ.one("#uploadHidden [type=file]").trigger("click");
                    };
                    this.preview = function () {
                        µ.one("@previewid").value = bookid;
                        Waiting.over();
                        Windows.open.call("previewWindow").then(function (event) {
                            µ.one("#preview").submit();
                        });
                    };
                    this.google = function () {
                        window.open(this.getAttribute("link"));
                    };
                    this.recommand = function () {
                        Waiting.over();
                        Windows.open.call("recommandWindow");
                    };
                    this.close = function () {
                        this.closest("window").fade(false).then(function () { Waiting.over(false); });
                    };
                    this[actclick].call(this);
                },
                clickNote: function () {
                    var userNote = µ.one("#userNote"), $note = this.getAttribute("note");
                    if (userNote.value === $note && userNote.value === "1") {
                        userNote.value = 0;
                    } else {
                        userNote.value = $note;
                    }
                    Detail.userNote();
                },
                data: {},
                links: function () {
                    var sb = this.getAttribute("searchby"), txt = this.text();
                    if (!!sb && !!txt) {
                        µ.one("#formSearch [type=search]", "").value = txt;
                        µ.alls("#formSearch [name=searchby]")[sb].checked = true;
                        µ.one("#formSearch").trigger("submit");
                    }
                },
                mainColor: function (image) {
                    var rgbColor = colorthief.getColor(image),
                        hexColor = "#" + ((1 << 24) + (rgbColor[0] << 16) + (rgbColor[1] << 8) + rgbColor[2]).toString(16).substr(1);

                    return { rgb: rgbColor, hex:hexColor};
                },
                modify: function () {
                    if (!!this.hasClass("modify")) {
                        if (this.hasClass("hide")) {
                            var siblings = this.siblings("[name]");
                            for (var jta = 0, lg = siblings.length; jta < lg; jta++) { siblings[jta].value = siblings[jta].getAttribute("oldvalue"); }
                        }
                        this.toggleClass("hide");
                        this.siblings("[field]:not(.noValue), [name]").toggle(null);
                        var input = this.siblings("[name]")[0];
                        input.focus();
                        if (input.tagName.toLowerCase() === "textarea") { input.scrollTop = 0; }
                    }
                    return;
                },
                mouseNote: function () {
                    var note = µ.one("#userNote").value || 0, $note = this.getAttribute("note"), stars = µ.alls("[note]").toArray();
                    if (note !== $note) {
                        for (var index=0; index < Math.max(note, $note); index++) {
                            if (index < Math.min(note, $note)) {
                                stars[index].src = images[stars[index].getAttribute("select")].black;
                            } else {
                                if (note > $note) {
                                    stars[index].src = images[stars[index].getAttribute("hoverminus")].black;
                                } else {
                                    stars[index].src = images[stars[index].getAttribute("hoverplus")].black;
                                }
                            }
                        }
                    }
                },
                new: function () {
                    Detail.data.book = {};
                    Detail.show(false);
                    µ.one("#formNew").reset();
                    µ.alls("#formNew input, #formNew textarea, .volumeInfo:not(.nonEditable), .volumeInfo:not(.nonEditable) button").toggle(true);
                    µ.alls("#formNew [field]").toggle(false);
                },
                newCell: function () {
                    µ.alls("[actclick=add], [actclick=update], #upload, .inCollection").toggle();
                    var cell = Bookcells.one(Detail.data.book.id);
                    if (µ.one("#collection").hasClass("active") && !cell) {
                        var lg = User.get().collection.length,
                            col = lg % Dock.nbcols,
                            row = µ.alls("[colid=\"" + lg % Dock.nbcols + "\"] .bookcell").length;

                        cell = new Bookcell(Detail.data.book);
                        Bookcells.cells.push(cell);
                        Bookcells.display();
                    }
                    if (!!cell && !!cell.cell) { cell.cell.alls("button").fade(); }
                    User.get().addbook(Detail.data.book);
                },
                sendNotif: function () {
                    var notif = this.formToJson();
                    notif.book = Detail.data.book.id;
                    notif.title = Detail.data.book.title;
                    if (!!Detail.data.book.alt) { notif.alt = Detail.data.book.alt; }
                    socket.emit("sendNotif", notif);
                    µ.one("#recommandWindow img").trigger("click");
                    return false;
                },
                show: function (inCollection) {
                    var book = Detail.data.book, win = µ.one("#detailWindow");
                    µ.one("#formNew").reset();
                    µ.one("#formRecommand").reset();
                    win.alls("#formNew input, #formNew textarea").toggle(false);
                    win.alls("#formNew button:not(.categories)").toggleClass("hide", false).toggleClass("modify", !!book.id && _.isEqual(book.id.user, User.get().id));
                    //win.one("#detailWindow [type=file]").value = "";
                    µ.one("#comments").children.removeAll();
                    µ.one("#userComment").value = "";
                    //win.css({ "background": "whitesmoke"/*, "max-height": ~~(window.innerHeight * 0.95)*/ });
                    for (var jta = 0, lg = µ.alls("[note]").length; jta < lg; jta++) { Images.blur.call(µ.alls("[note]")[jta]); }
                    µ.one("#userNote").value = book.note;
                    win.alls(".new").toggleClass("new", false);
                    win.alls(".inCollection").toggle(!!inCollection).css({ "background": "whitesmoke" });
                    Tags.list();
                    µ.one("#background").toggle(!!book.alternative || !!book.base64);
                    //if (!!book.mainColor) {
                    //    µ.one("#background").css({ "background": "radial-gradient(whitesmoke 40%, " + book.mainColor + ")" });
                    //} else {
                        //µ.one("#detailCover").onload = function () {
                            if (!!book.alternative || !!book.base64) {
                                //book.mainColor = Detail.mainColor(this).hex;
                                //win.css({ "background": "radial-gradient(whitesmoke 40%, " + book.mainColor + ")"});
                                µ.one("#background").css({ "background-image": "url(" + (book.alternative || book.base64).toString() + ")" });
                            }
                        //};
                    //}
                    //µ.one("#detailCover").setAttributes("mainColor", null).src = book.alternative || book.base64|| images["book-4-icon"].black;
                    win.alls(".direct").text("");
                    win.alls("#userTags > div").removeAll();
                    //win.one("#detailWindow .windowheader span").text(book.title || µ.one("#detailWindow .windowheader span").getAttribute("label"));
                    µ.alls("[actclick=add]").toggle(!inCollection);
                    µ.alls("[actclick=update], [actclick=recommand]").toggle(!!inCollection);
                    µ.alls("[actclick=associated]").toggle(!!book.id && !_.isObject(book.id));
                    µ.alls("[actclick=preview]").toggle(!!book.access && book.access !== "NONE");
                    µ.alls("[actclick=google]").setAttributes({ "link": book.link }).toggle(!!book.link);
                    µ.alls("[actclick=upload]").toggle(!book.base64 && !book.cover && !!inCollection);
                    win.alls(".comments").toggle(!!book.comments && !!book.comments.length);
                    win.alls("#detailWindow [field]").toggleClass("noValue", false);
                    win.alls("[field=authors] span").removeAll();
                    win.alls(".volumeInfo.nonEditable").toggle(false);
                    win.alls(".volumeInfo:not(.nonEditable)").toggle(!!book.id && _.isEqual(book.id.user, User.get().id));
                    Detail.userNote();
                    if (!!win.hasClass("notdisplayed")) { Windows.open.call("detailWindow").then(function () {
                        µ.one("#detailContent").css({ "height": win.clientHeight - win.one("header").clientHeight });
                        µ.one(".detailBook").scrollTop = 0;
                    }); }
                    _.forEach(book, function (value, jta) {
                        var field = win.one("[field=" + jta + "]"), input = win.one("input[name=" + jta + "], textarea[name=" + jta + "]");
                        if (!!field && jta !== "subtitle") {
                            field.closest("volumeInfo").toggle(!!value || _.isEqual(book.id.user, User.get().id));
                            field.toggle(!!value).toggleClass("noValue", !value);
                        }
                        switch (jta) {
                            case "authors":
                                for (var aut = 0, lga = value.length; aut < lga; aut++) { field.newElement("span", { "class": "link", "searchby": 3 }).text(value[aut]); }
                                input.value = value.join(", ");
                                input.setAttribute("oldvalue", value.join(", "));
                                field.parentNode.alls("button").toggle(!!value.length);
                                break;
                            case "tags":
                                var userTags = µ.one("#userTags");
                                for (var tag = 0, lgt = value.length; tag < lgt; tag++) { userTags.appendChild(Tags.new(value[tag])); }
                                break;
                            case "userNote":
                                if (!!value) { Detail.clickNote.call(µ.one("[note=\"" + value + "\"]")); }
                                break;
                            case "userComment":
                                µ.one("#userComment").value = value;
                                break;
                            case "comments":
                                var mNote, cNotes = 0;
                                if (!value.length) { win.one(".comments").toggle(false); }
                                for (var com = 0, lgc = value.length; com < lgc; com++) {
                                    if (!!value[com].comment) {
                                        var comment = µ.one("#tempComment").cloneNode(true);
                                        comment.removeAttribute("id");
                                        comment.one(".commentAuthor").text(value[com].name);
                                        comment.one(".commentDate").text(value[com].date.fd());
                                        comment.one(".commentNote").text(value[com].note);
                                        comment.one(".commentComment").html(value[com].comment);
                                        µ.one("#comments").appendChild(comment);
                                    }
                                    if (!!value[com].note) {
                                        mNote = (mNote || 0) + parseInt(value[com].note, 10);
                                        cNotes++;
                                    }
                                }
                                if (typeof mNote !== "undefined" && !!cNotes) {
                                    mNote = (mNote / cNotes).toFixed(2);
                                    µ.one(".subtitle").toggle(true);
                                    µ.one("#mNote").text(mNote);
                                }
                                break;
                            default:
                                if (!field) { break; }
                                if (_.isArray(value)) { value = value.join(", "); }
                                if (!!input) {
                                    input.setAttribute("oldvalue", value);
                                    input.value = value;
                                    input.scrollTop = 0;
                                }
                                if (field.tagName.toLowerCase() === "time") {
                                    field.setAttribute("datetime", new Date(value));
                                    value = value.fd();
                                }
                                if (jta === "description") { field.html(value); } else { field.text(value); }
                                break;
                        }
                    });
                    µ.alls(".link").setEvents("click", Detail.links, false);
                },
                uploadCover: function () {
                    var image = this.files;
                    if (!!image[0]) {
                        if (!image[0].type.match(/image.*/) || image[0].size > 500000) {
                            Windows.confirm("error", "Veuillez sélectionner un fichier de type \"image\" inférieure à 500KB.");
                            return false;
                        }
                        var reader = new FileReader();
                        reader.onload = (function(image) {
                            return function(e) {
                                image.onload = function () {
                                    var mainColor = Detail.mainColor(this);
                                    this.toggleClass("new", true).setAttribute("mainColor", mainColor.hex);
                                    µ.one("#detailContent").css("background", "radial-gradient(whitesmoke 40%, " + mainColor.hex + ")");
                                };
                                image.src = e.target.result;
                            };
                        })(µ.one("#detailCover"));
                        reader.readAsDataURL(this.files[0]);
                    }
                },
                userNote: function () {
                    var stars = µ.alls("[note]").toArray(), note = µ.one("#userNote").value;
                    for (var index = 0; index < stars.length; index++) {
                        if (index < note) {
                            stars[index].src = images[stars[index].getAttribute("select")].black;
                        } else {
                            stars[index].src = images[stars[index].getAttribute("source")].black;
                        }
                    }
                }
            },
            Dock = {
                get: function () {
                    var $dock = µ.one("#d"), colWidth;
                    if (!$dock) {
                        $dock = µ.body.newElement("section", { id: "d", role: "main"});
                        $dock.newElement("section", { "class": "notdisplayed" });
                    }
                    colWidth = ($dock.clientWidth / Dock.nbcols).toFixed(0);
                    if ($dock.alls(".col").length !== Dock.nbcols) {
                        $dock.alls(".col").removeAll();
                        for (var i = 0; i < Dock.nbcols; i++) { $dock.newElement("div", { "class": "col", "colid": i }).css({ "width": colWidth, "max-width": colWidth }); }
                        //$dock.css({ "padding-top" : µ.one("#nvb").isVisible() ? µ.one("#nvb").clientHeight : 0 });
                        µ.alls(".col").setEvents({
                            dragenter: function(event) { event.preventDefault(); },
                            dragover: function(event) { event.preventDefault(); },
                            drop: function (event) {
                                event.preventDefault();
                                var cell = Bookcells.one(JSON.parse(event.dataTransfer.getData("text"))).cell, target = event.target.closest("bookcell");
                                if (!!target) {
                                    if (cell !== target) {
                                        target.closest("col").insertBefore(cell, target);
                                        Bookcells.loadcovers();
                                        if (µ.one(".sortBy")) { Images.blur.call(µ.one(".sortBy").toggleClass("sortBy", false)); }
                                    }
                                } else {
                                    this.appendChild(cell);
                                    if (µ.one(".sortBy")) { Images.blur.call(µ.one(".sortBy").toggleClass("sortBy", false)); }
                                }
                                return false;
                            }
                        });
                    }
                    return $dock;
                },
                nbcols: ~~(window.innerWidth / 192),
                remove: function () {
                    if (!!µ.one("#d")) { µ.one("#d").removeAll(); window.scroll(0, 0); }
                },
                resize: function() {
                    if (Dock.nbcols !== ~~(window.innerWidth / 192)) {
                        Tags.close().then(Tags.destroy);
                        µ.alls(".deroulant").fade(false);
                        Dock.nbcols = ~~(window.innerWidth / 192);
                        Dock.remove();
                        Bookcells.display();
                    } else {
                        µ.alls(".col").css({ "width": ~~(window.innerWidth / Dock.nbcols), "max-width": ~~(window.innerWidth / Dock.nbcols) });
                    }
                    if (µ.one("#detailWindow").isVisible()) {
                        µ.one("#detailWindow").css({ "height": ~~(window.innerHeight * 0.95), "max-height": ~~(window.innerHeight * 0.95) });
                    }
                    return;
                }
            },
            Idb = {
                deleteDetail: function (bookid) {
                    if (!Idb.db) { return; }
                    Idb.db.transaction(["details"], "readwrite").objectStore("details").delete(bookid);
                },
                deleteQuery: function (key) {
                    if (!Idb.db) { return; }
                    Idb.db.transaction(["queries"], "readwrite").objectStore("queries").delete(key);
                },
                getDetail: function (bookid) {
                    return new Promise(function (resolve) {
                        if (!Idb.db) { resolve(); }
                        var request = Idb.db.transaction(["details"], "readwrite").objectStore("details").index("by_id").get(bookid);
                        request.onsuccess = function () { if (!!this.result) { resolve(this.result); } else { resolve(); }};
                        request.onerror = function () { resolve(); };
                    });
                },
                getQuery: function (key) {
                    return new Promise(function (resolve, reject) {
                        if (!Idb.db) { reject(); }
                        var request = Idb.db.transaction(["queries"], "readwrite").objectStore("queries").index("by_query").get(JSON.stringify(key));
                        request.onsuccess = function () {
                            if (!!this.result && !!this.result.books && !!this.result.books.length) {
                                resolve(this.result.books);
                            } else {
                                reject();
                            }};
                        request.onerror = reject;
                    });
                },
                init: function () {
                    Idb.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
                    return new Promise(function (resolve, reject) {
                        if (!!Idb.indexedDB) {
                            var request = indexedDB.open(User.get().session, 1);
                            request.onerror = function () { reject(); };
                            request.onsuccess = function () {
                                console.debug("DB Opened", new Date().toLocaleString());
                                Idb.db = this.result;
                                resolve();
                            };
                            request.onupgradeneeded = function() {
                                var db = this.result;
                                db.createObjectStore("queries", { keyPath: "query" }).createIndex("by_query", "query", { unique: true });
                                db.createObjectStore("details", { keyPath: "id" }).createIndex("by_id", "id", { unique: true });
                                console.debug("DB Updated", new Date().toLocaleString());
                            };
                        }
                    });
                },
                setDetail: function (book) {
                    if (!Idb.db) { return; }
                    var request = Idb.db.transaction(["details"], "readwrite").objectStore("details").put(book);
                },
                setQuery: function (key, value) {
                    if (!Idb.db) { return; }
                    var request = Idb.db.transaction(["queries"], "readwrite").objectStore("queries").put({ "query": JSON.stringify(key), "books": value });
                }
            },
            Images = {
                active: function () {
                    var isactive = µ.one(".active"), thisImg = this.one("img");
                    if (!!isactive) {
                        isactive.toggleClass("active", false);
                        Images.blur.call(isactive);
                    }
                    this.toggleClass("active", true);
                    µ.one("#tags").toggle(this.id === "collection" && !!Tags.cloud && !!Tags.cloud.length);
                    if (!!thisImg) { thisImg.src = images[thisImg.getAttribute("source")][thisImg.getAttribute("active")]; }
                    return this;
                },
                blur: function () {
                    var image = this.tagName.toLowerCase() === "img" ? this : this.one("img");
                    if (!!this.hasClass("active") || !!this.hasClass("sortBy")) { return false; }
                    if (!!image) { image.src = images[image.getAttribute("source")][image.getAttribute("blur")];
                        if (!image.isVisible() && !image.hasClass("nsv")) { image.css({ visibility: "visible" }); }
                    }
                    return this;
                },
                hover: function () {
                    var image = this.tagName.toLowerCase() === "img" ? this : this.one("img");
                    if (!!this.hasClass("active") || !!this.hasClass("sortBy")) { return false; }
                    if (!!image) { image.src = images[image.getAttribute("source")][image.getAttribute("hover")]; }
                    return this;
                }
            },
            logout = function () {
                Waiting.toggle(true);
                User.destroy();
                if (!!Idb.indexedDB) { Idb.indexedDB.deleteDatabase(User.get().session); }
                socket.destroy();
                location.assign("/logout");
                return false;
            },
            Menu = {
                close: function (event) {
                    var closact = event.target.closest("action");
                    //if (µ.one("#contextMenu").isVisible() && !event.target.getAttribute("nav")) { µ.one("#contextMenu").fade(false); }
                    if (!closact || !_.includes(["notifications", "tris"], closact.getAttribute("id"))) { µ.alls(".deroulant").fade(false); }
                },
                /*context: function (event) {
                    event.preventDefault();
                    var ctx = µ.one("#contextMenu");
                    if (µ.one("#detailWindow").isVisible() && !µ.one("#w").hasClass("over") && !_.isEmpty(Detail.data.book)) {
                        ctx.css({
                            top: ((event.clientY + ctx.clientHeight > window.innerHeight) ? event.clientY - ctx.clientHeight : event.clientY),
                            left: ((event.clientX + ctx.clientWidth > window.innerWidth) ? event.clientX - ctx.clientWidth : event.clientX)
                        }).fade(true);
                    }
                    return false;
                },*/
                link: function () { window.open(this.getAttribute("url")); },
                mail: function () { µ.location.href = "mailto:" + this.getAttribute("mail"); },
/*                nav: function () {
                    if (!Detail.data.cell) { return false; }
                    var cell = Detail.data.cell, row = cell.index(), col = parseInt(cell.parentNode.getAttribute("colid"), 10);
                    switch (this.getAttribute("nav")) {
                        case "top":
                            if (!row) { return false; }
                            row--;
                            break;
                        case "right":
                            col++;
                            if (col === Dock.nbcols) { col = 0; row++; }
                            break;
                        case "left":
                            if (!col) { col = Dock.nbcols; row--; }
                            col--;
                            break;
                        case "bottom":
                            row++;
                            break;
                    }
                    if (µ.one("[colid=\"" + col + "\"]").childNodes[row]) {
                        µ.one("[colid=\"" + col + "\"]").childNodes[row].one("header").trigger("click");
                    }
                    return false;
                },*/
                notif: function (state) {
                    var notifs = µ.one("#notifs");
                    /*if (!!state) { µ.one("#sort").fade(false); }*/
                    if (notifs.isVisible()) { notifs.fade(false); } else {
                        notifs/*.css({ top: µ.one("#nvb").clientHeight + 5, left: µ.one("#notifications").offsetLeft })*/.fade(0.95);
                    }
                },
                selectstart: function (event) {
                    event.preventDefault();
                    if (!!event.target.tagName && !_.includes(["input", "textarea"], event.target.tagName.toLowerCase())) { return false; }
                },
                show: function () {
                    Images.hover.call(µ.one("#sort img"));
                    µ.alls("#tags, #notifications").toggle(false);
                },
                sort: function (state) {
                    var sorts = µ.one("#sort");
                    //if (!!state) { µ.one("#notifs").fade(false); }
                    /*µ.one(".tnv").trigger("click");*/
                    if (sorts.isVisible()) { sorts.fade(false); } else {
                        sorts/*.css({ top: µ.one("#nvb").clientHeight, left: µ.one("#tris").offsetLeft })*/.fade(0.95);
                    }
                },
                toggle: function () {
                    var isv = !!µ.one("#nvb").isVisible();
                    /*µ.one("html").toggleClass("overflown", !isv);*/
                    /*µ.one("#nvb").fade(!isv ? 0.9 : !isv);*/
                    µ.one("#nvb").toLeft(!isv);
                    µ.one(".nvb:not(#nvb)").fade(isv);
                },
                toggleFooter: function () {
                    µ.one("#footer").toggle(!!xcroll().top);
                },
                top: function () {
                    var timer = setInterval(function () {
                        var scr = ((xcroll().top / 2) - 0.1).toFixed(1);
                        window.scroll(0, scr);
                        if (scr <= 0.1) { window.scroll(0, 0); clearInterval(timer); }
                    }, 100);
                }
            },
            Notifs = {
                click: function () {
                    var notif = JSON.parse(this.getAttribute("notif")),
                        bookid = notif._id.book;

                    _.remove(Notifs.list, notif);
                    Notifs.last = notif;
                    µ.one("#notifs").toggle();
                    this.removeAll();
                    µ.alls("#notifications, #notifNumber").toggle(!!Notifs.list.length);
                    µ.one("#notifNumber").text(Notifs.list.length);
                    Waiting.toggle(true, true);
                    socket.emit("readNotif", notif);
                },
                show: function (list) {
                    var notifs = [];
                    if (!!list) { Notifs.list = list; }
                    µ.alls("#notifications, #notifNumber").toggle(!!Notifs.list.length);
                    µ.one("#notifNumber").text(Notifs.list.length);
                    for (var jta = 0, lg = Notifs.list.length; jta < lg; jta++) {
                        var notif = Notifs.list[jta], clone = µ.one("#tempNotif").cloneNode(true);
                        clone.setAttributes({ notif: JSON.stringify(notif) }).removeAttribute("id");
                        clone.one(".notifName").html(notif.from);
                        clone.one(".notifTitle").text(notif.title);
                        clone.setEvents("click", Notifs.click);
                        µ.one("#notifs").appendChild(clone);
                    }
                }
            },
            Search = {
                associated: function (bookid) {
                    Search.clear();
                    Search.last = { "associated": bookid };
                    Windows.close(true).then(function () {
                        Waiting.toggle(true, true).then(function () {
                            Idb.getQuery(Search.last)
                                .then(Bookcells.show, function () {
                                    µ.one("#nvb").toggleClass("inactive", true);
                                    Waiting.anim(true);
                                    socket.emit("associated", bookid);
                                })
                                .catch(function (error) { console.error(error); });
                        });
                    });
                },
                books: function () {
                    var val = this.formToJson(), stored;
                    Search.last = { q: val.searchby + val.searchinput, langRestrict: val.langage };
                    µ.one("@filtre").value = µ.one("@last").value = "";
                    Search.clear();
                    Windows.close(true).then(function () {
                        Waiting.toggle(true, true).then(function () {
                            Idb.getQuery(Search.last)
                                .then(Bookcells.show)
                                .catch(function () {
                                    µ.one("#nvb").toggleClass("inactive", true);
                                    Waiting.anim(true);
                                    socket.emit("searchBooks", Search.last);
                                });
                        });
                    });
                    return false;
                },
                clear: function () {
                    Bookcells.destroy();
                    Dock.remove();
                    Images.active.call(µ.one("#recherche"));
                    µ.one("#formFilter").reset();
                    if (µ.one(".sortBy")) { Images.blur.call(µ.one(".sortBy").toggleClass("sortBy", false)); }
                    //µ.one("#selectedTag").text("");
                },
                endRequest: function (nb) {
                    µ.one("#nvb").toggleClass("inactive", false);
                    Waiting.anim(false);
                    if (!nb) { Waiting.toggle(false); }
                    if (!µ.one("#collection").hasClass("active") && !!Search.last) { Idb.setQuery(Search.last, Bookcells.books); }
                    console.debug("Search.endRequest", new Date().toLocaleString(), Bookcells.cells.length);
                },
                gtrans: function () {
                    var action = this.id;
                    Windows.confirm("warning", "Cette opération va importer/exporter vos EBooks depuis/vers votre bibliothèque Google.<BR>Etes vous sur de vouloir continuer?")
                        .then(function () {
                            if (action === "exportNow") { return socket.emit("exportNow"); }
                            Bookcells.destroy();
                            Images.active.call(µ.one("#collection"));
                            µ.one("#nvb").toggleClass("inactive", true);
                            Waiting.anim(true);
                            Windows.close(true).then(function () {
                                Waiting.toggle(true, true);
                                socket.emit("importNow");
                            });
                        });
                },
                recommand: function () {
                    Search.clear();
                    Search.last = { "recommand": User.get().id };
                    Windows.close(true).then(function () {
                        Waiting.toggle(true, true).then(function () {
                            Idb.getQuery(Search.last)
                                .then(Bookcells.show)
                                .catch(function () {
                                    µ.one("#nvb").toggleClass("inactive", true);
                                    Waiting.anim(true);
                                    socket.emit("recommanded");
                                });
                        });
                    });
                }
            },
            /*shortCuts = function (event) {
                event = event || window.event;
                if (!event.altKey) {
                    if (!event.ctrlKey) { if (event.keyCode === 27) { Windows.close(); Tags.close(); µ.one("#contextMenu").fade(false); }} else {
                        var action;
                        switch (event.keyCode) {
                            case 77: Menu.toggle(); action = true; break;
                            case 76: logout(); action = true; break;
                            case 82: µ.one("#recherche").trigger("click"); action = true; break;
                            case 80: µ.one("#profil").trigger("click"); action = true; break;
                            case 66: µ.one("#collection").trigger("click"); action = true; break;
                            case 69: µ.one("#tags").trigger("click"); action = true; break;
                            case 73: µ.one("#contact").trigger("click"); action = true; break;
                            case 72: µ.one("#help").trigger("click"); action = true; break;
                        }
                        if (action) {
                            event.preventDefault();
                            return false;
                        }
                    }
                }
            },*/
            socket = (function (conn) {
                var connect = function () {
                        var connection = conn.connect("https://192.168.9.27", { "secure": true, "multiplex": false });
                        connection.once("connect", function () {
                            this.once("disconnect", function (data) {
                                console.debug("socket.disconnect", this.id, new Object(this), new Date().toLocaleString(), data);
                                reconnect(this);
                                User.destroy();
                                Windows.close().then(function () {
                                    Waiting.toggle(true, true);
                                    Waiting.connection(true);
                                    µ.alls(".deroulant").toggle(false);
                                    if (!!µ.one("#picture img")) { µ.one("#picture img").removeAll(); }
                                    µ.alls("#notifications, #tags").toggle(false);
                                    Images.blur.call(µ.one(".active").toggleClass("active", false));
                                    var forms = µ.alls("form");
                                    for (var jta = 0, lg = forms.length; jta < lg; jta++) { forms[jta].reset(); }
                                    Bookcells.destroy();
                                });
                            })
                            .on("books", Bookcells.show)
                            .on("collection", function (ret) {
                                //User.get().books = ret.books;
                                //Tags.init();
                                //µ.one("#collection").trigger("click");
                                userActions.collection(ret.books).then(Tags.init);
                                //µ.one("#nbBooks").text(User.get().books.length);
                                console.debug("User.get().books", new Date().toLocaleString(), ret.books.length, (new Date() - start) / 1000);
                                Notifs.show(ret.notifs);
                            })
                            .on("covers", function (covers) {
                                for (var jta = 0, lg = covers.length; jta < lg; jta++) {
                                    if (!covers[jta] || !covers[jta].id || !covers[jta].base64) { continue; }
                                    var cover = covers[jta], bookcell = User.get().bookcell(cover.id), book = bookcell.book;
                                    book.base64 = cover.base64;
                                    if (!!bookcell && !!bookcell.cell) {
                                        var cell = bookcell.cell;
                                        if (!cell.hasClass("toshow")) { cell.one(".cover").src = cover.base64; }
                                        if (!!Detail.data.book && Detail.data.book.id === book.id) { µ.one("#detailCover").src = cover.base64; }
                                    }
                                }
                                console.debug("socket.covers", new Date().toLocaleString(), (new Date() - start) / 1000);
                            })
                            .on("endRequest", Search.endRequest)
                            .on("error", function (error) { console.warn(error); })
                            .on("logout", logout)
                            .on("newbook", function (data) {
                                Detail.bookid = data.id;
                                Detail.data = { book: data };
                                Detail.newCell();
                                Detail.show(true);
                                Waiting.over(false);
                            })
                            .on("returnAdd", userActions.addbook)
                            .on("returnDetail", Bookcells.returned)
                            .on("returnNotif", function (notif) {
                                Detail.bookid = notif.id;
                                Detail.data = { book: notif };
                                Detail.show(User.get().bookindex(notif.id) !== -1);
                            })
                            .on("updateNok", userActions.nokdated)
                            .on("updateOk", userActions.updated)
                            .on("user", function (ret) {
                                Menu.show();
                                current = User.get().init(ret);
                                if (!Idb.db) { Idb.init(); }
                            }).emit("isConnected");
                            console.debug("socket.connect", this.id, new Object(this), new Date().toLocaleString());

                        });
                        return connection;
                    },
                    reconnect = function(cur) {
                        cur.destroy();
                        var connectTimeInterval = setInterval(function () {
                            if (!!cur && !!cur.connected && cur.io.readyState === "open") {
                                clearInterval(connectTimeInterval);
                                socket = connect();
                            }
                            try { cur.connect(); } catch(error) { /*console.error(error);*/ }
                        }, 3000);
                    };

                return connect();
            })(io),
            Tags = {
                add: function (/*event*/) {
                    //event.preventDefault();
                    var tag = this.formToJson().tag.toLowerCase(),
                        tags = µ.alls("#userTags > div").toArray(),
                        exist = _.find(tags, function (elt) { return elt.one(".libelle").html() === tag; });

                    if (!exist) {
                        tags.push(Tags.new(tag, true));
                        tags = _.sortBy(tags, function (tag) { return tag.one(".libelle").text(); });
                        for (var jta = 0, lg = tags.length; jta < lg; jta++) { µ.one("#userTags").appendChild(tags[jta]); }
                    }
                    this.reset();
                    return false;
                },
                close: function () {
                    return new Promise(function (resolve) {
                        if (µ.one("#cloud").isVisible()) { Tags.show().then(resolve); } else { Waiting.over(false); resolve(); }
                    });
                },
                destroy: function () { µ.alls("#cloud span").removeAll(); },
                generate: function () {
                    var cloud = µ.one("#cloud"),
                        click = function () { Tags.show(); Bookcells.bytags(this.text()); Waiting.toggle(false); },
                        height = ~~(cloud.clientHeight / 2),
                        width = ~~(cloud.clientWidth / 2),
                        ratio = width / height,
                        step = 3.0,
                        µtags = [],
                        isOver = function(elem, others) {
                            var overlap = function(a, b) {
                                return (Math.abs(2.0 * a.offsetLeft + a.offsetWidth - 2.0 * b.offsetLeft - b.offsetWidth) < a.offsetWidth + b.offsetWidth) && (Math.abs(2.0 * a.offsetTop + a.offsetHeight - 2.0 * b.offsetTop - b.offsetHeight) < a.offsetHeight + b.offsetHeight);
                            };
                            for(var i = 0, lg = others.length; i < lg; i++) { if (overlap(elem, others[i])) { return true; }}
                            return false;
                        };

                    Tags.destroy();
                    for (var jta = 0, lg = Tags.cloud.length; jta < lg; jta++) {
                        var tag = Tags.cloud[jta],
                            µtag = cloud.newElement("span", { "class": "tag tag" + Math.min(~~(tag.weight / 5) + 1, 10) }).html(tag.text),
                            top = height - (µtag.clientHeight / 2),
                            left = width - (µtag.clientWidth / 2),
                            radius = 0,
                            angle = 6.28 * Math.random();

                        µtag.css({ top: top, left: left });
                        while(isOver(µtag, µtags)) {
                            radius += step;
                            angle += (jta % 2 === 0 ? 1 : -1) * step;
                            top = height + radius * Math.sin(angle) - (µtag.clientHeight / 2.0);
                            left = width - (µtag.clientWidth / 2.0) + (radius * Math.cos(angle)) * ratio;
                            µtag.css({ top: top, left: left });
                        }
                        µtags.push(µtag);
                    }
                    cloud.alls("span").setEvents("click", click);
                },
                init: function () {
                    var tags = _.countBy(_.flatten(_.compact(_.pluck(User.get().collection, "book.tags")), true).sort());
                    Tags.cloud = [];
                    Tags.destroy();
                    if (!!tags) {
                        var tagOptions = "";
                        _.forEach(tags, function (nb, tag) {
                            Tags.cloud.push({ "text": tag, "weight": nb });
                            tagOptions += "<option>" + tag + "</option>";
                        });
                        µ.one("#tagsList").html(tagOptions);
                        Tags.cloud = _.sortBy(Tags.cloud, "weight").reverse();
                        if (µ.one("#collection").hasClass("active")) { µ.one("#tags").toggle(!_.isEmpty(tags)); }
                    }
                },
                list: function () { µ.one("@tag").setAttributes({ "list": !!this.value ? "tagsList" : "none" });},
                new: function (tag, isNew) {
                    var clone = µ.one("#tempTag").cloneNode(true);
                    clone.removeAttribute("id");
                    clone.setEvents("click", function (event) {
                        if (event.target.hasClass("libelle")) {
                            Windows.close().then(Bookcells.bytags(event.target.text()));
                        } else {
                            this.fade(false).then(function () { clone.removeAll(); µ.one("#detailWindow [autofocus]").focus(); });
                        }
                    });
                    clone.one(".libelle").html(tag).toggleClass("new", !!isNew);
                    return clone;
                },
                show: function () {
                    var cloud = µ.one("#cloud"), vis = cloud.isVisible();
                    return new Promise(function (resolve) {
                        if (µ.one("#wa").isVisible() || !µ.one("#collection").hasClass("active")) { resolve(); } else {
                            Windows.close().then(function () {
                                µ.one("html").toggleClass("overflown", !vis);
                                if (!!vis) { cloud.fade(false).then(resolve); } else {
                                    cloud.fade(0.9).then(function () {
                                        if (!cloud.alls("span").length) { Tags.generate(); }
                                        resolve();
                                    });
                                }
                            });
                        }
                    });
                }
            },
            User = (function () {
                var instance, User = function () {};
                User.prototype.init = function (data) {
                    _.assign(this, data);
                    this.collection = [];
                    if (!!this.picture && !!this.link) {
                        µ.one("#picture")
                            .setEvents("click", function () { window.open(instance.link); })
                            .toggle(true).newElement("img", { src: this.picture, title: "Google+" });
                        µ.one("#picture").newElement("span").html(this.name);
                        µ.one("#picture").newElement("hr");
                    }
                    µ.alls(".gSignIn").toggle(!!this.googleSignIn);
                    µ.alls(".noSignIn").toggle(!this.googleSignIn);
                    µ.one(".noSignIn input").setAttributes("required", !this.googleSignIn);
                    if (!this.connex) { Windows.help(true); }
                    console.debug("User.get().initialize", new Date().toLocaleString());
                    return this;
                };
                User.prototype.addbook = function (book) {
                    /*if (this.bookindex(book.id) === -1) {
                        this.books.push(book);
                        this.books = _.sortBy(this.books, "title");
                    }
                    var cell = Bookcells.one(book.id);
                    if (!!cell) { cell.book = book; }*/
                    var newcell = new Bookcell(book);
                    this.collection.push(newcell);
                    newcell.cell.one(".add").toggle(false);
                    newcell.cell.one(".remove").toggle(true);
                    µ.one("#nbBooks").text(this.collection.length);
                };
                User.prototype.bookcell = function (bookid) { return _.find(this.collection, _.matchesProperty("book.id", bookid)); };
                User.prototype.book = function (bookid) {
                    var bookcell = this.bookcell(bookid);
                    return !!bookcell && !!bookcell.book ? bookcell.book : null;
                };
                User.prototype.bookindex = function (bookid) {
                    return _.findIndex(this.collection, _.matchesProperty("book.id", bookid));
                };
                User.prototype.removebook = function (bookid) {
                    _.remove(this.collection, _.matchesProperty("id", bookid));
                    µ.one("#nbBooks").text(this.collection.length);
                };
                User.prototype.updated = function (values) {
                    this.name = values.name;
                    this.googleSync = values.googleSync;
                    Windows.close();
                };
                User.prototype.updatebook = function (book) {
                    //var index = this.bookindex(book.id);
                    _.assign(book, book.update);
                    delete book.update;
                    //if (index !== -1) { _.assign(this.collection[index].book, book); }
                    var bookcell = this.bookcell(book.id);
                    _.assign(bookcell.book, book);
                    //var bookcell = Bookcells.one(book.id);
                    //if (!!bookcell && (!!book.title || !!book.authors || !!book.alternative)) {
                    if (!!book.title) { bookcell.cell.one("header").text(book.title); }
                    if (!!book.authors) { bookcell.cell.one("figcaption").text(book.authors.join(", ")); }
                    if (!!book.alternative) { bookcell.cell.one(".cover").src = book.alternative; }
                    //}
                };

                return {
                    get: function () {
                        if (!instance) { instance = new User(); }
                        return instance;
                    },
                    destroy: function () {
                        instance = false;
                    }
                };
            })(),
            userActions = {
                addbook: function (book) {
                    return User.get().addbook(book);
                },
                collection: function (books) {
                    return new Promise(function (resolve) {
                        Windows.close();
                        µ.one("@filtre").value = µ.one("@last").value/* = µ.one("#selectedTag").innerHTML*/ = "";
                        if (!µ.one("#collection").hasClass("active")) {
                            var isSort = µ.one(".sortBy");
                            if (isSort) { Images.blur.call(isSort.toggleClass("sortBy", false)); }
                            Images.hover.call(µ.one("#sort div")).toggleClass("sortBy", true);
                            Bookcells.destroy();
                            Waiting.anim(true);
                            Waiting.toggle(true, true).then(function () {
                                µ.one("#nvb").toggleClass("inactive", true);
                                Images.active.call(µ.one("#collection"));
    /*                            if (!!books && !!books.length) {
                                    if (!User.get().collection) { Bookcells.show(User.get().books).then(function (ret) {
                                        if (!!Bookcells.cells.length) { User.get().collection = Bookcells.cells; }
                                        Search.endRequest(ret);
                                    }); }
                                    else {
                                        Bookcells.cells = User.get().collection;
                                        Bookcells.display(false, false, true).then(
                                            Search.endRequest
                                        );
                                    }
                                } else { Search.endRequest(); }*/
                                if (!!User.get().collection && User.get().collection.length) {
                                    Bookcells.cells = User.get().collection;
                                    Bookcells.display(false, false, true).then(function (nb) {
                                        Search.endRequest(nb);
                                        resolve();
                                    });
                                } else if (!!books && !!books.length) {
                                    Bookcells.show(books).then(function (ret) {
                                        if (!!Bookcells.cells.length) {
                                            User.get().collection = Bookcells.cells;
                                        }
                                        µ.one("#nbBooks").text(ret);
                                        Search.endRequest(ret);
                                        resolve();
                                    });
                                } else {
                                    Search.endRequest();
                                    resolve();
                                }
                            });
                        } else {
                            window.scroll(0, 0);
                            µ.alls(".bookcell").toggleClass("tofilter tohide", false);
                            µ.one("#sort [by]").trigger("click");
                            resolve();
                        }
                    });
                },
                delete: function () {
                    µ.one("#errPwd").toggle(false);
                    if (!µ.one("@pwd").reportValidity()) { return; }
                    Windows.confirm("warning", µ.one("#delete").getAttribute("confirm")).then(function () { console.debug("pwd", µ.one("@pwd"), µ.one("@pwd").value); socket.emit("deleteUser", µ.one("@pwd").value); });
                    return false;
                },
                nokdated: function () {
                    µ.one("#errPwd").toggle(true);
                    return false;
                },
                update: function () {
                    console.debug("update", this, this.formToJson());
                    µ.one("#errPwd").fade(false);
                    socket.emit("updateUser", this.formToJson());
                    return false;
                }
            },
            Waiting = {
                anim: function (toShow) {
                    µ.one("#wa").fade(toShow);
                },
                over: function (toShow) {
                    µ.one("#w").toggleClass("over", toShow);
                },
                toggle: function (visible, withIcon) {
                    Waiting.p = new Promise(function (resolve) {
                        var wait = µ.one("#w");
                        wait.one("img").toggle(!!withIcon);
                        if (wait.isVisible() === visible || !!Windows.on || !!Waiting.on) { resolve(); } else {
                            Waiting.on = true;
                            µ.alls(".description").removeAll();
                            if (!!visible) {
                                µ.one("html").toggleClass("overflown", true);
                                wait.fade(0.5).then(resolve);
                            } else {
                                wait.fade(false).then(function () {
                                    µ.one("html").toggleClass("overflown", false);
                                    Waiting.over(false);
                                    Waiting.connection(false);
                                    resolve();
                                });
                            }
                        }
                    });
                    Waiting.p.then(function () {
                        delete Waiting.on;
                    });
                    return Waiting.p;
                },
                connection: function (toShow) {
                    var noConnect = µ.one("#noConnect"),
                        mouseMove = function (event) {
                            noConnect.css({
                                "top": (noConnect.clientHeight + event.clientY > window.innerHeight) ? event.clientY - noConnect.clientHeight: event.clientY,
                                "left": (noConnect.clientWidth + event.clientX > window.innerWidth) ? event.clientX - noConnect.clientWidth: event.clientX
                            });
                        };

                    if (!!toShow) { µ.setEvents({ mousemove: mouseMove }); } else {
                        µ.removeEventListener("mousemove", mouseMove);
                    }
                    noConnect.toggle(toShow);
                }
            },
            Windows = {
                close: function (notTog) {
                    return new Promise(function (resolve) {
                        var win = µ.alls(".window:not(.notdisplayed)"), forms = µ.alls("form:not(#formFilter)");
                        Waiting.over(false);
                        /*if (µ.one("#h").isVisible()) { Windows.help(false); }*/
                        //µ.removeEventListener("keyup", shortCuts);
                        if (!win.length) { resolve(); } else {
                            for (var jta = 0, lg = forms.length; jta < lg; jta++) { forms[jta].reset(); }
                            win.fade(false).then(function () {
                                delete Windows.on;
                                if (notTog === true) { resolve(); } else { Waiting.toggle().then(resolve); }
                            });
                        }
                    });
                },
                confirm: function (type, msg) {
                    return new Promise(function (resolve, reject) {
                        Waiting.over();
                        µ.one("#confirmWindow header span").text(µ.one("#confirmWindow header span").getAttribute(type));
                        µ.one("#confirmWindow #confirm").text(msg);
                        //µ.alls("#confirmWindow button").setEvents("click", Windows.close);
                        µ.one("#confirmWindow .valid").setEvents("click", function () { resolve(); });
                        µ.one("#confirmWindow .cancel").toggle(type === "warning").setEvents("click", function () { reject(); });
                        Waiting.toggle(true).then(function () {
                            µ.one("#confirmWindow").css({ "top": xcroll().top + 10, "left": "25%" }).fade(true);
                            µ.setEvents({ "keyup keydown" : Window.esc });
                        });
                    });
                },
                /*esc: function (event) { if (event.keyCode === 27) { Windows.close(); } },*/
                /*help: function (toShow) {
                    if (toShow === µ.one("#h").isVisible()) { return; }
                    if (typeof toShow !== "boolean") { toShow = !µ.one("#h").isVisible(); }
                    if (!!toShow) {
                        Windows.close().then(function () {
                            µ.one("html").toggleClass("overflown", true);
                            µ.one("#h").toggle(true);
                        });
                    } else {
                        µ.one("html").toggleClass("overflown", false);
                        µ.one("#h").toggle(false);
                    }
                },*/
                open: function () {
                    var self = this;
                    return new Promise(function (resolve, reject) {
                        var wid = (typeof self === "string") ? self : self.getAttribute("window"), win = µ.one("#" + wid);
                        if (!!Windows.on && Windows.on === wid) { Windows.close().then(resolve); } else {
                            /*if (µ.one("#h").isVisible()) { Windows.help(false); }*/
                            Tags.close().then(function () {
                                if (µ.one("#wa").isVisible()) { resolve(); }
                                if (!_.includes(["previewWindow", "recommandWindow"], wid)) {µ.alls(".window:not(.notdisplayed)").fade(false); } else { Waiting.over(true); }
                                if (wid === "profileWindow") {
                                    µ.one("@mail").value = User.get().id;
                                    µ.one("@name").value = User.get().name;
                                    if (!!User.get().googleSignIn) {
                                        µ.one("@googleSignIn").setAttribute("checked", true);
                                        if (!!User.get().googleSync) { µ.one("@googleSync").setAttribute("checked", true); }
                                    } else {
                                        µ.one("@pwd").setAttribute("required", true);
                                    }
                                    if (!µ.one(".changePwd.notdisplayed")) { Windows.togglePwd(); }
                                }
                                Waiting.toggle(true).then(function () {
                                    Windows.on = wid;
                                    win.css({ "top": xcroll().top /*+ 10*/ }).fade(true);
                                    if (win.one("[autofocus]")) { win.one("[autofocus]").focus(); }
                                    resolve();
                                });
                                µ.alls(".errMsg").toggle(false);
                            });
                        }
                    });
                },
                togglePwd: function () {
                    µ.alls(".changePwd").fade().then(function (self) {
                        for (var jta = 0, lg = self.length; jta < lg; jta++) {
                            self[jta].alls("[type=password]").setAttributes({ "required": self[jta].isVisible() });
                        }
                    });
                }
            },
            xcroll = function () { return { top: window.scrollY || µ.documentElement.scrollTop, left: window.scrollX || µ.documentElement.scrollLeft }; };

        Bookcell.prototype.active = function () {
            if (!!this.actived) { return; }
            var action = function () {
                    var type = this.classList;
                    self.cell.alls("button").fade();
                    if (_.includes(type, "add")) { socket.emit("addBook", self.id); }
                    if (_.includes(type, "remove")) {
                        if (µ.one("#collection").hasClass("active")) {
                            self.cell.fade().then(function () {
                                self.cell.removeAll();
                                Bookcells.loadcovers();
                            });
                        }
                        socket.emit("removeBook", self.id);
                        User.get().removebook(self.id);
                        if (!!self.book.tags && !!self.book.tags.length) { Tags.init(); }
                    }
                },
                description = function (event) {
                    if (!!event.relatedTarget && !event.relatedTarget.hasClass("description")) { µ.alls(".description").removeAll(); }
                    if (event.type !== "mouseenter") { return; }
                    if (!self.book.description) { return; } else {
                        var index = self.book.description.indexOf(" ", 500),
                            leave = function () { this.removeAll(); },
                            position = {
                                "max-height": window.innerHeight,
                                left: (Math.min(this.xposition() + (this.clientWidth / 3), window.innerWidth - (this.clientWidth * 1.333))).toFixed(0)
                            },
                            top = (this.offsetTop + (this.clientHeight / 3)).toFixed(0),
                            description = µ.body.newElement("div", { "width": this.clientWidth, "bookid": self.id, "class": "description notdisplayed" })
                                .css({ "width": this.clientWidth })
                                .setEvents("click", leave)
                                .html("<span>" + self.book.title + "</span><BR>" + self.book.description.substr(0, Math.max(index, 500)) + ((index !== -1) ? "..." : ""));

                        if (top + description.clientHeight > µ.clientHeight) {
                            position.bottom = this.clientHeight * 0.333;
                        } else {
                            position.top =  top;
                        }
                        description.css(position);
                        setTimeout(function () { description.setEvents("mouseleave", leave).fade(0.9); }, 1000);
                    }
                },
                detail = function () {
                    if (User.get().bookindex(self.id) !== -1 || !!self.opened) {
                        Detail.data = self;
                        Detail.show(User.get().bookindex(self.id) !== -1);
                    } else {
                        Idb.getDetail(self.id).then(function (result) {
                            if (!!result) {
                                Detail.data.book = result;
                                Detail.show(false);
                            } else {
                                Waiting.toggle(true, true);
                                socket.emit("searchDetail", self.id);
                            }
                        });
                    }
                    return false;
                },
                dragstart = function (event) {
                    this.toggleClass("isDrag", true);
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.dropEffect = "move";
                    event.dataTransfer.setData("text", JSON.stringify(id));
                },
                dragend = function () {
                    this.toggleClass("isDrag", false);
                },
                id = this.id,
                loadcover = function () {
                    if (!self.cell.hasClass("toshow")) { return; }
                    var cover = self.cell.one(".cover");
                    if (!!cover && window.innerHeight + xcroll().top > self.cell.offsetTop) {
                        self.cell.toggleClass("toshow", false);
                        self.cell.setEvents({ dragstart: dragstart, dragend: dragend });
                        if (!!self.book.alternative || !!self.book.base64) { cover.src = self.book.alternative || self.book.base64; }
                        self.cell.one("footer").css({ "bottom": self.cell.one("figcaption").clientHeight + 5 });
                    }
                },
                self = this;

            this.cell.alls("header, figure").setEvents("click", detail);
            this.cell.alls("button").setEvents("click", action);
            this.cell.setEvents({ "mouseenter mouseleave": description, dragstart: dragstart, dragend: dragend });
            this.cell.one("footer").css({ "bottom": this.cell.one("figcaption").clientHeight + 5 });
            this.actived = true;
            this.loadcover = loadcover;
        };
        Bookcell.prototype.returned = function (book) {
            this.book = book;
            this.opened = true;
            Detail.data = this;
            Detail.show();
            Idb.setDetail(book);
        };

        µ.setEvents({/* "keypress": shortCuts, "keydown": shortCuts, */"scroll": Bookcells.loadcovers });
        µ.alls("input").setEvents("input propertychange", checkValid);
        µ.one("#logout").setEvents("click", logout);
        µ.alls("#h button, #help").setEvents({ "click": Windows.help });
        µ.one("#formSearch").setEvents("submit", Search.books);
        µ.one("#formProfil").setEvents("submit", userActions.update);
        µ.one("#formRecommand").setEvents("submit", Detail.sendNotif);
        µ.one("#formTag").setEvents("submit", Tags.add);
        µ.alls("form").setEvents("submit", function (event) { event.preventDefault(); });
        µ.alls("#formNew button").setEvents("click", Detail.modify);
        µ.one("#changePwd").setEvents("click", Windows.togglePwd);
        µ.one("#delete").setEvents("click", userActions.delete);
        µ.one("#tris").setEvents("click", Menu.sort);
        µ.one("#notifications").setEvents("click", Menu.notif);
        µ.alls("#sort > div").setEvents("click", Bookcells.sort);
        //µ.alls("img[actclick]").setEvents({ "mouseenter": Images.hover, "mouseleave": Images.blur});
        µ.alls("[actclick]").setEvents("click", Detail.action);
        µ.alls(".closeWindow").setEvents("click", Windows.close);
        µ.one("#footer").setEvents("click", Menu.top);
        µ.alls("#uploadHidden [type=file]").setEvents("change", Detail.uploadCover);
        µ.alls("#userNote > img").setEvents({ "mouseenter": Detail.mouseNote, "mouseleave": Detail.userNote, "click": Detail.clickNote });
        /*µ.alls(".nvb > div:not(#picture):not(.filtre), img.closeWindow, #footer, [by], .imgAction img, #cloud img, #contactsWindow img, [nav]").setEvents({ "mouseenter": Images.hover, "mouseleave": Images.blur });*/
        (function (toblur) { for (var jta = 0, lg = toblur.length; jta < lg; jta++) { Images.blur.call(toblur[jta]); } })(µ.alls("[blur]"));
        µ.alls("img").setAttributes({ "draggable": false });
        //µ.one("#nvb").toggleClass("notdisplayed", false);
        µ.one("#collection").setEvents("click", userActions.collection);
        µ.alls("#tags, #cloud > img").setEvents("click", Tags.show);
        µ.alls("#recherche, #profil, #contact").setEvents("click", Windows.open);
        µ.one("#newbook").setEvents("click", Detail.new);
        µ.alls(".tnv, .action").setEvents("click", Menu.toggle);
        µ.alls("[url]").setEvents("click", Menu.link);
        µ.alls("[mail]").setEvents("click", Menu.mail);
        µ.one("#recommand4u").setEvents("click", Search.recommand);
        µ.alls("#importNow, #exportNow").setEvents("click", Search.gtrans);
        µ.alls("@tag").setEvents("input propertychange", Tags.list);
        window.setEvents({/* "contextmenu": Menu.context, */"resize": Dock.resize, "click": Menu.close, "selectstart": Menu.selectstart });
        µ.alls("[nav]").setEvents("click", Menu.nav);
        (function (search) {
            if (!!search) {
                µ.one("@filtre").setEvents("search", Bookcells.filter);
            } else {
                µ.one("#formFilter").setEvents("submit", function (event) {
                    Bookcells.filter.call(µ.one("@filtre"));
                    return false;
                });
            }
        })("onsearch" in µ.createElement("input"));
    });
}
