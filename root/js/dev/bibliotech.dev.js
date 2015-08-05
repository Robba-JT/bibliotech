if (!window.FileReader || !window.Promise || !("formNoValidate" in document.createElement("input"))) {
    alert(document.body.getAttribute("error"));
} else {
    var µ = document;
    µ.setEvents("DOMContentLoaded", function () {
        "use strict";
        var start = new Date();
        console.debug("µ.ready", start.toLocaleString());
        var Bookcell = function (book, indice) {
                var totalCells = Bookcells.cells.length + (typeof indice === "undefined" ? 1 : indice);
                this.id = book.id;
                this.book = book;
                this.cell = one("#tempCell").cloneNode(true).removeAttributes("id").toggleClass("bookcell", true);
                this.cell.one("header").text(book.title);
                this.cell.one("figcaption").text(!!book.authors ? book.authors.join(", ") : "");
                this.cell.one(".previewable").toggle(!!book.access && book.access !== "NONE");
                this.cell.one(".recommanded").toggle(!!book.from);
                this.cell.one(".personnal").toggle(_.isEqual(book.id.user, current.id));
                this.cell.one(".add").toggle(current.bookindex(book.id) === -1);
                this.cell.one(".remove").toggle(current.bookindex(book.id) !== -1);
                this.cell.col = totalCells % Dock.nbcols;
                this.cell.row = Math.floor(totalCells / Dock.nbcols);
                if (!!book.alternative || !!book.base64) { this.cell.one(".cover").src = book.alternative || book.base64; }
                this.active();
                return this;
            },
            Bookcells = {
                add: function (cells) {
                    Bookcells.cells = _.union(Bookcells.cells, _.isArray(cells) ? cells : [cells] );
                },
                books: [],
                bytags: function (tag) {
                    if (!one("#collection").hasClass("active")) { return; }
                    window.scroll(0, 0);
                    one("#formFilter").reset();
                    all(".bookcell").toggleClass("tofilter", false);
                    one("#selectedTag").html(tag);
                    for (var jta = 0, lg = Bookcells.cells.length; jta < lg; jta++) {
                        var bcell = Bookcells.cells[jta];
                        bcell.cell.toggleClass("tohide", !_.includes(bcell.book.tags, tag));
                    }
                    Bookcells.display();
                },
                cells: [],
                destroy: function () {
                    Dock.remove(); Bookcells.cells = [];
                },
                display: function (cells, filter) {
                    return new Promise(function (resolve) {
                        if (!cells && !!one(".sortBy")) { return Bookcells.sort.call(one(".sortBy")); }
                        cells = cells || _.sortBy(Bookcells.cells, function (cell) { return [ cell.row, cell.col ]; });
                        var indice = 0, $dock = Dock.get();
                        for (var jta = 0, lg = cells.length; jta < lg; jta++) {
                            var bcell = cells[jta], cell = cells[jta].cell;
                            if (!!cell.hasClass("tohide") || !!cell.hasClass("tofilter")) { Dock.get().one("section.notdisplayed").appendChild(cell); } else {
                                cell.toggleClass("toshow", true);
                                $dock.one("[colid='"+ ((!!filter) ? cell.col : indice % Dock.nbcols) +"']").appendChild(cell);
                                indice++;
                            }
                        }
                        Waiting.toggle(false);
                        Bookcells.loadcovers();
                        resolve(Bookcells.cells.length);
                    });
                },
                filter: function () {
                    var filtre = this.value.toLowerCase(), last = one("@last");
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
                            var newCell = new Bookcell(current.book(books[jta].id) || books[jta], jta);
                            newCells.push(new Bookcell(current.book(books[jta].id) || books[jta], jta));
                        }
                        Bookcells.add(newCells);
                        if (!one("#collection").hasClass("active") && !!Search.last) { Bookcells.books = _.flattenDeep(Bookcells.books.push(books)); }
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
                    window.scroll(0, 0);
                    if (this.hasClass("active")) { return; }
                    var self = this;
                    if (!!one(".sortBy")) { Images.blur.call(one(".sortBy").toggleClass("sortBy", false)); }
                    Images.hover.call(this).toggleClass("sortBy", true);
                    Bookcells.display(_.sortByOrder(Bookcells.cells, function (cell) { return cell.book[self.getAttribute("by")] || null; }, self.getAttribute("sort") !== "desc"));
                }
            },
            checkValid = function () {
                var n;
                this.setCustomValidity("");
                switch (this.name) {
                case "confirmPwd":
                    n = (this.value !== one("@newPwd").value);
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
                    n = (this.value.toLowerCase() === current.id);
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
            current,
            Detail = {
                action: function () {
                    var bookid = Detail.data.book.id, index = current.bookindex(bookid), book, actclick = this.getAttribute("actclick");
                    if (index !== -1) { book = current.books[index]; }
                    this.add = function () {
                        if (!bookid) {
                            var newbook = one("#formNew").formToJson(), error, inputs = all("#formNew input, #formNew textarea");
                            for (var jta = 0, lg = inputs.length; jta < lg; jta++) { if (!inputs[jta].reportValidity()) { error = true; break; }}
                            newbook.authors = !!newbook.authors ? newbook.authors.split(",") : [];
                            for (jta = 0, lg = newbook.authors.length; jta < lg; jta++) { newbook.authors[jta] = newbook.authors[jta].noSpace(); }
                            if (!!error) { return false; }
                            Waiting.over();
                            socket.emit("newbook", newbook);
                        } else {
                            socket.emit("addDetail");
                            all("[actclick='upload']").toggle(!Detail.data.book.cover);
                            Detail.newCell();
                        }
                    };
                    this.associated = function () {
                        Search.associated(bookid);
                    };
                    this.update = function () {
                        var update = false,
                            values = { id: bookid },
                            tags = _.map(all("#userTags > div").toArray(), function (tag) { return tag.one(".libelle").text(); }),
                            note = one("#userNote").value,
                            comment = one("#userComment").value,
                            mainColor = one("#detailCover").getAttribute("mainColor"),
                            alternative = one("#detailCover").getAttribute("src") !== images["book-4-icon"].black ? one("#detailCover").getAttribute("src") : null;

                        if (_.isObject(bookid) && bookid.user === current.id) {
                            var formValues = one("#formNew").formToJson();
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
                        if (!!mainColor && book.alternative !== alternative) {
                            update = true;
                            values.alternative = alternative;
                            values.mainColor = mainColor;
                        }
                        if (!!update) {
                            values.userDate = new Date().toJSON();
                            socket.emit("updateBook", values);
                            current.updatebook(values);
                            Tags.init();
                            one("#tags").toggle(!!Tags.cloud.length && one("#collection").hasClass("active"));
                        }
                        Windows.close();
                    };
                    this.upload = function () {
                        one("#uploadHidden [type=file]").trigger("click");
                    };
                    this.preview = function () {
                        one("@previewid").value = bookid;
                        Waiting.over();
                        Windows.open.call("previewWindow").then(function (event) {
                            one("#preview").submit();
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
                    var userNote = one("#userNote"), $note = this.getAttribute("note");
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
                        one("#formSearch [type=search]", "").value = txt;
                        all("#formSearch [name=searchby]")[sb].checked = true;
                        one("#formSearch").trigger("submit");
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
                    var note = one("#userNote").value || 0, $note = this.getAttribute("note"), stars = all("[note]").toArray();
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
                    one("#formNew").reset();
                    all("#formNew input, #formNew textarea, .volumeInfo:not(.nonEditable), .volumeInfo:not(.nonEditable) button").toggle(true);
                    all("#formNew [field]").toggle(false);
                },
                newCell: function () {
                    all("[actclick=add], [actclick=update], #upload, .inCollection").toggle();
                    var cell = Bookcells.one(Detail.data.book.id);
                    if (one("#collection").hasClass("active") && !cell) {
                        var col = current.books.length % Dock.nbcols,
                            row = all("[colid='" + current.books.length % Dock.nbcols + "'] .bookcell").length;

                        cell = new Bookcell(Detail.data.book);
                        Bookcells.add(cell);
                        Bookcells.display();
                    }
                    if (!!cell && !!cell.cell) { cell.cell.all("button").fade(); }
                    current.addbook(Detail.data.book);
                },
                sendNotif: function (event) {
                    event.preventDefault();
                    var notif = this.formToJson();
                    notif.book = Detail.data.book.id;
                    notif.title = Detail.data.book.title;
                    if (!!Detail.data.book.alt) { notif.alt = Detail.data.book.alt; }
                    socket.emit("sendNotif", notif);
                    one("#recommandWindow img").trigger("click");
                    return false;
                },
                show: function (inCollection) {
                    var book = Detail.data.book, win = one("#detailWindow");
                    one("#formNew").reset();
                    one("#formRecommand").reset();
                    win.all("#formNew input, #formNew textarea").toggle(false);
                    win.all("#formNew button:not(.categories)").toggleClass("hide", false).toggleClass("modify", !!book.id && _.isEqual(book.id.user, current.id));
                    win.one("#detailWindow [type=file]").value = "";
                    one("#comments").children.removeAll();
                    one("#userComment").value = "";
                    win.css({ "background": "whitesmoke", "max-height": ~~(window.innerHeight * 0.95) });
                    for (var jta = 0, lg = all("[note]").length; jta < lg; jta++) { Images.blur.call(all("[note]")[jta]); }
                    one("#userNote").value = book.note;
                    win.all(".new").toggleClass("new", false);
                    win.all(".inCollection").toggle(!!inCollection);
                    Tags.list();
                    if (!!book.mainColor) {
                        win.css({ "background": "radial-gradient(whitesmoke 40%, " + book.mainColor + ")" });
                    } else {
                        one("#detailCover").onload = function () {
                            if (!!book.alternative || !!book.base64) {
                                book.mainColor = Detail.mainColor(this).hex;
                                win.css({ "background": "radial-gradient(whitesmoke 40%, " + book.mainColor + ")"});
                            }
                        };
                    }
                    one("#detailCover").setAttributes("mainColor", null).src = book.alternative || book.base64|| images["book-4-icon"].black;
                    win.all(".direct").text("");
                    win.all("#userTags > div").removeAll();
                    win.one("#detailWindow .windowheader span").text(book.title || one("#detailWindow .windowheader span").getAttribute("label"));
                    all("[actclick=add]").toggle(!inCollection);
                    all("[actclick=update], [actclick=recommand]").toggle(!!inCollection);
                    all("[actclick=associated]").toggle(!!book.id && !_.isObject(book.id));
                    all("[actclick=preview]").toggle(!!book.access && book.access !== "NONE");
                    all("[actclick=google]").setAttributes({ "link": book.link }).toggle(!!book.link);
                    all("[actclick=upload]").toggle(!book.base64 && !book.cover && !!inCollection);
                    win.all(".comments").toggle(!!book.comments && !!book.comments.length);
                    win.all("#detailWindow [field]").toggleClass("noValue", false);
                    win.all("[field=authors] span").removeAll();
                    win.all(".volumeInfo.nonEditable").toggle(false);
                    win.all(".volumeInfo:not(.nonEditable)").toggle(!!book.id && _.isEqual(book.id.user, current.id));
                    Detail.userNote();
                    if (!!win.hasClass("notdisplayed")) { Windows.open.call("detailWindow"); }
                    _.forEach(book, function (value, jta) {
                        var field = win.one("[field=" + jta + "]"), input = win.one("input[name=" + jta + "], textarea[name=" + jta + "]");
                        if (!!field && jta !== "subtitle") {
                            field.closest("volumeInfo").toggle(!!value || _.isEqual(book.id.user, current.id));
                            field.toggle(!!value).toggleClass("noValue", !value);
                        }
                        switch (jta) {
                            case "authors":
                                for (var aut = 0, lga = value.length; aut < lga; aut++) { field.newElement("span", { "class": "link", "searchby": 3 }).text(value[aut]); }
                                input.value = value.join(", ");
                                input.setAttribute("oldvalue", value.join(", "));
                                field.parentNode.all("button").toggle(!!value.length);
                                break;
                            case "tags":
                                var userTags = one("#userTags");
                                for (var tag = 0, lgt = value.length; tag < lgt; tag++) { userTags.appendChild(Tags.new(value[tag])); }
                                break;
                            case "userNote":
                                if (!!value) { Detail.clickNote.call(one("[note='" + value + "']")); }
                                break;
                            case "userComment":
                                one("#userComment").value = value;
                                break;
                            case "comments":
                                var mNote, cNotes = 0;
                                if (!value.length) { win.one(".comments").toggle(false); }
                                for (var com = 0, lgc = value.length; com < lgc; com++) {
                                    if (!!value[com].comment) {
                                        var comment = one("#tempComment").cloneNode(true);
                                        comment.removeAttribute("id");
                                        comment.one(".commentAuthor").text(value[com].name);
                                        comment.one(".commentDate").text(value[com].date.fd());
                                        comment.one(".commentNote").text(value[com].note);
                                        comment.one(".commentComment").html(value[com].comment);
                                        one("#comments").appendChild(comment);
                                    }
                                    if (!!value[com].note) {
                                        mNote = (mNote || 0) + parseInt(value[com].note, 10);
                                        cNotes++;
                                    }
                                }
                                if (typeof mNote !== "undefined" && !!cNotes) {
                                    mNote = (mNote / cNotes).toFixed(2);
                                    one(".subtitle").toggle(true);
                                    one("#mNote").text(mNote);
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
                    all(".link").setEvents("click", Detail.links, false);
                },
                uploadCover: function () {
                    var image = this.files;
                    if (!!image[0]) {
                        if (!image[0].type.match(/image.*/) || image[0].size > 500000) {
                            Windows.confirm("error", "Veuillez sélectionner un fichier de type 'image' inférieure à 500KB.");
                            return false;
                        }
                        var reader = new FileReader();
                        reader.onload = (function(image) {
                            return function(e) {
                                image.onload = function () {
                                    var mainColor = Detail.mainColor(this);
                                    this.toggleClass("new", true).setAttribute("mainColor", mainColor.hex);
                                    one("#detailContent").css("background", "radial-gradient(whitesmoke 40%, " + mainColor.hex + ")");
                                };
                                console.debug(e.target.result);
                                image.src = e.target.result;
                            };
                        })(one("#detailCover"));
                        reader.readAsDataURL(this.files[0]);
                    }
                },
                userNote: function () {
                    var stars = all("[note]").toArray(), note = one("#userNote").value;
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
                    var $dock = one("#d"), colWidth;
                    if (!$dock) {
                        $dock = µ.body.newElement("section", { id: "d", role: "main"});
                        $dock.newElement("section", { "class": "notdisplayed" });
                    }
                    colWidth = ($dock.clientWidth / Dock.nbcols).toFixed(0);
                    if ($dock.all(".col").length !== Dock.nbcols) {
                        $dock.all(".col").removeAll();
                        for (var i = 0; i < Dock.nbcols; i++) { $dock.newElement("div", { "class": "col", "colid": i }).css({ "width": colWidth, "max-width": colWidth }); }
                        $dock.css({ "padding-top" : one("#nvb").isVisible() ? one("#nvb").clientHeight : 0 });
                        all(".col").setEvents({
                            dragenter: function(event) { event.preventDefault(); },
                            dragover: function(event) { event.preventDefault(); },
                            drop: function (event) {
                                event.preventDefault();
                                var cell = Bookcells.one(JSON.parse(event.dataTransfer.getData("text"))).cell, target = event.target.closest("bookcell");
                                if (!!target) {
                                    if (cell !== target) {
                                        target.closest("col").insertBefore(cell, target);
                                        Bookcells.loadcovers();
                                        if (one(".sortBy")) { Images.blur.call(one(".sortBy").toggleClass("sortBy", false)); }
                                    }
                                } else {
                                    this.appendChild(cell);
                                    if (one(".sortBy")) { Images.blur.call(one(".sortBy").toggleClass("sortBy", false)); }
                                }
                                return false;
                            }
                        });
                    }
                    return $dock;
                },
                nbcols: ~~(window.innerWidth / 256),
                remove: function () {
                    if (!!one("#d")) { one("#d").removeAll(); window.scroll(0, 0); }
                },
                resize: function() {
                    if (Dock.nbcols !== ~~(window.innerWidth / 256)) {
                        Tags.close().then(Tags.destroy);
                        all(".deroulant").fade(false);
                        Dock.nbcols = ~~(window.innerWidth / 256);
                        Dock.remove();
                        Bookcells.display();
                    } else {
                        all(".col").css({ "width": ~~(window.innerWidth / Dock.nbcols), "max-width": ~~(window.innerWidth / Dock.nbcols) });
                    }
                    if (one("#detailWindow").isVisible()) {
                        one("#detailWindow").css({ "height": ~~(window.innerHeight * 0.95), "max-height": ~~(window.innerHeight * 0.95) });
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
                            if (!!this.result && !!this.result.books) {
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
                            var request = indexedDB.open(current.session, 1);
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
                    var isactive = one(".active"), thisImg = this.one("img");
                    if (!!isactive) {
                        isactive.toggleClass("active", false);
                        Images.blur.call(isactive);
                    }
                    this.toggleClass("active", true);
                    one("#tags").toggle(this.id === "collection" && !!Tags.cloud.length);
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
                if (!!Idb.indexedDB) { Idb.indexedDB.deleteDatabase(current.session); }
                socket.destroy();
                location.assign("/logout");
                return false;
            },
            Menu = {
                close: function (event) {
                    var closact = event.target.closest("action");
                    if (one("#contextMenu").isVisible() && !event.target.getAttribute("nav")) { one("#contextMenu").fade(false); }
                    if (!closact || !_.includes(["notifications", "tris"], closact.getAttribute("id"))) { all(".deroulant").fade(false); }
                },
                context: function (event) {
                    event.preventDefault();
                    var ctx = one("#contextMenu");
                    if (one("#detailWindow").isVisible() && !one("#w").hasClass("over") && !_.isEmpty(Detail.data.book)) {
                        ctx.css({
                            top: ((event.clientY + ctx.clientHeight > window.innerHeight) ? event.clientY - ctx.clientHeight : event.clientY),
                            left: ((event.clientX + ctx.clientWidth > window.innerWidth) ? event.clientX - ctx.clientWidth : event.clientX)
                        }).fade(true);
                    }
                    return false;
                },
                link: function () { window.open(this.getAttribute("url")); },
                mail: function () { µ.location.href = "mailto:" + this.getAttribute("mail"); },
                nav: function () {
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
                    if (one("[colid='" + col + "']").childNodes[row]) {
                        one("[colid='" + col + "']").childNodes[row].one("header").trigger("click");
                    }
                    return false;
                },
                notif: function (state) {
                    var notifs = one("#notifs");
                    if (!!state) { one("#sort").fade(false); }
                    if (notifs.isVisible()) { notifs.fade(false); } else {
                        notifs.css({ top: one("#nvb").clientHeight + 5, left: one("#notifications").offsetLeft }).fade(0.95);
                    }
                },
                selectstart: function (event) {
                    event.preventDefault();
                    if (!!event.target.tagName && !_.includes(["input", "textarea"], event.target.tagName.toLowerCase())) { return false; }
                },
                show: function () {
                    Images.hover.call(one("#sort img"));
                    all("#tags, #notifications").toggle(false);
                },
                sort: function (state) {
                    var sorts = one("#sort");
                    if (!!state) { one("#notifs").fade(false); }
                    if (sorts.isVisible()) { sorts.fade(false); } else {
                        sorts.css({ top: one("#nvb").clientHeight + 5, left: one("#tris").offsetLeft }).fade(0.95);
                    }
                },
                toggle: function () {
                    all(".nvb").fade().then(function () {
                        if (!!one("#d")) { one("#d").css({ "padding-top": one("#nvb").isVisible() ? one("#nvb").clientHeight : 0 }); }
                    });
                },
                toggleFooter: function () {
                    one("#footer").toggle(!!xcroll().top);
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
                    one("#notifs").toggle();
                    this.removeAll();
                    all("#notifications, #notifNumber").toggle(!!Notifs.list.length);
                    one("#notifNumber").text(Notifs.list.length);
                    Waiting.toggle(true, true);
                    socket.emit("readNotif", notif);
                },
                show: function (list) {
                    var notifs = [];
                    if (!!list) { Notifs.list = list; }
                    all("#notifications, #notifNumber").toggle(!!Notifs.list.length);
                    one("#notifNumber").text(Notifs.list.length);
                    for (var jta = 0, lg = Notifs.list.length; jta < lg; jta++) {
                        var notif = Notifs.list[jta], clone = one("#tempNotif").cloneNode(true);
                        clone.setAttributes({ notif: JSON.stringify(notif) }).removeAttribute("id");
                        clone.one(".notifName").html(notif.from);
                        clone.one(".notifTitle").text(notif.title);
                        clone.setEvents("click", Notifs.click);
                        one("#notifs").appendChild(clone);
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
                                    one("#nvb").toggleClass("inactive", true);
                                    Waiting.anim(true);
                                    socket.emit("associated", bookid);
                                });
                        });
                    });
                },
                books: function (event) {
                    event.preventDefault();
                    var val = this.formToJson(), stored;
                    Search.last = { q: val.searchby + val.searchinput, langRestrict: val.langage };
                    one("@filtre").value = one("@last").value = "";
                    Search.clear();
                    Windows.close(true).then(function () {
                        Waiting.toggle(true, true).then(function () {
                            Idb.getQuery(Search.last)
                                .then(Bookcells.show)
                                .catch(function () {
                                    one("#nvb").toggleClass("inactive", true);
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
                    Images.active.call(one("#recherche"));
                    one("#formFilter").reset();
                    if (one(".sortBy")) { Images.blur.call(one(".sortBy").toggleClass("sortBy", false)); }
                    one("#selectedTag").text("");
                },
                endRequest: function (nb) {
                    one("#nvb").toggleClass("inactive", false);
                    Waiting.anim(false);
                    if (!nb) { Waiting.toggle(false); }
                    if (!one("#collection").hasClass("active") && !!Search.last) { Idb.setQuery(Search.last, Bookcells.books); }
                    console.debug("Search.endRequest", new Date().toLocaleString(), Bookcells.cells.length);
                },
                gtrans: function () {
                    var action = this.id;
                    Windows.confirm("warning", "Cette opération va importer/exporter vos EBooks depuis/vers votre bibliothèque Google.<BR>Etes vous sur de vouloir continuer?")
                        .then(function () {
                            if (action === "exportNow") { return socket.emit("exportNow"); }
                            Bookcells.destroy();
                            Images.active.call(one("#collection"));
                            one("#nvb").toggleClass("inactive", true);
                            Waiting.anim(true);
                            Windows.close(true).then(function () {
                                Waiting.toggle(true, true);
                                socket.emit("importNow");
                            });
                        });
                },
                recommand: function () {
                    Search.clear();
                    Search.last = { "recommand": current.id };
                    Windows.close(true).then(function () {
                        Waiting.toggle(true, true).then(function () {
                            Idb.getQuery(Search.last)
                                .then(Bookcells.show)
                                .catch(function () {
                                    one("#nvb").toggleClass("inactive", true);
                                    Waiting.anim(true);
                                    socket.emit("recommanded");
                                });
                        });
                    });
                }
            },
            shortCuts = function (event) {
                event = event || window.event;
                if (!event.altKey) {
                    if (!event.ctrlKey) { if (event.keyCode === 27) { Windows.close(); Tags.close(); one("#contextMenu").fade(false); }} else {
                        var action;
                        switch (event.keyCode) {
                            case 77: Menu.toggle(); action = true; break;
                            case 76: logout(); action = true; break;
                            case 82: one("#recherche").trigger("click"); action = true; break;
                            case 80: one("#profil").trigger("click"); action = true; break;
                            case 66: one("#collection").trigger("click"); action = true; break;
                            case 69: one("#tags").trigger("click"); action = true; break;
                            case 73: one("#contact").trigger("click"); action = true; break;
                            case 72: one("#help").trigger("click"); action = true; break;
                        }
                        if (action) {
                            event.preventDefault();
                            return false;
                        }
                    }
                }
            },
            socket = (function (conn) {
                var connect = function () {
                        var connection = conn.connect("localhost:5678", { "secure": true, "multiplex": false });
                        connection.once("connect", function () {
                            this.once("disconnect", function (data) {
                                console.debug("socket.disconnect", this.id, new Object(this), new Date().toLocaleString(), data);
                                reconnect(this);
                                User.destroy();
                                Windows.close().then(function () {
                                    Waiting.toggle(true, true);
                                    Waiting.connection(true);
                                    all(".deroulant").toggle(false);
                                    if (!!one("#picture img")) { one("#picture img").removeAll(); }
                                    all("#notifications, #tags").toggle(false);
                                    Images.blur.call(one(".active").toggleClass("active", false));
                                    var forms = all("form");
                                    for (var jta = 0, lg = forms.length; jta < lg; jta++) { forms[jta].reset(); }
                                    Bookcells.destroy();
                                });
                            })
                            .on("books", Bookcells.show)
                            .on("collection", function (ret) {
                                current.books = ret.books;
                                Tags.init();
                                one("#collection").trigger("click");
                                one("#nbBooks").text(current.books.length);
                                console.debug("current.books", new Date().toLocaleString(), current.books.length, (new Date() - start) / 1000);
                                Notifs.show(ret.notifs);
                            })
                            .on("covers", function (covers) {
                                for (var jta = 0, lg = covers.length; jta < lg; jta++) {
                                    if (!covers[jta] || !covers[jta].index || !covers[jta].base64) { continue; }
                                    var cover = covers[jta], book = current.books[cover.index], bookcell = Bookcells.cells[cover.index];
                                    book.base64 = cover.base64;
                                    if (!!bookcell && !!bookcell.cell) {
                                        var cell = bookcell.cell;
                                        if (!cell.hasClass("toshow")) { cell.one(".cover").src = cover.base64; }
                                        if (!!Detail.data.book && Detail.data.book.id === book.id) { one("#detailCover").src = cover.base64; }
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
                                Detail.show(current.bookindex(notif.id) !== -1);
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
                add: function (event) {
                    event.preventDefault();
                    var tag = this.formToJson().tag.toLowerCase(),
                        tags = all("#userTags > div").toArray(),
                        exist = _.find(tags, function (elt) { return elt.one(".libelle").html() === tag; });

                    if (!exist) {
                        tags.push(Tags.new(tag, true));
                        tags = _.sortBy(tags, function (tag) { return tag.one(".libelle").text(); });
                        for (var jta = 0, lg = tags.length; jta < lg; jta++) { one("#userTags").appendChild(tags[jta]); }
                    }
                    this.reset();
                    return false;
                },
                close: function () {
                    return new Promise(function (resolve) {
                        if (one("#cloud").isVisible()) { Tags.show().then(resolve); } else { Waiting.over(false); resolve(); }
                    });
                },
                destroy: function () { all("#cloud span").removeAll(); },
                generate: function () {
                    var cloud = one("#cloud"),
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
                            µtag = cloud.newElement("span", { "title": tag.weight, "class": "tag tag" + Math.min(~~(tag.weight / 5) + 1, 10) }).html(tag.text),
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
                    cloud.all("span").setEvents("click", click);
                },
                init: function () {
                    var tags = _.countBy(_.flatten(_.compact(_.pluck(current.books, "tags")), true).sort());
                    Tags.cloud = [];
                    Tags.destroy();
                    if (!!tags) {
                        var tagOptions = "";
                        _.forEach(tags, function (nb, tag) {
                            Tags.cloud.push({ "text": tag, "weight": nb });
                            tagOptions += "<option>" + tag + "</option>";
                        });
                        one("#tagsList").html(tagOptions);
                        Tags.cloud = _.sortBy(Tags.cloud, "weight").reverse();
                    }
                },
                list: function () { one("@tag").setAttributes({ "list": !!this.value ? "tagsList" : "none" });},
                new: function (tag, isNew) {
                    var clone = one("#tempTag").cloneNode(true);
                    clone.removeAttribute("id");
                    clone.setEvent("click", function (event) {
                        if (event.target.hasClass("libelle")) {
                            Windows.close().then(Bookcells.bytags(event.target.text()));
                        } else {
                            this.fade(false).then(function () { clone.removeAll(); one("#detailWindow [autofocus]").focus(); });
                        }
                    });
                    clone.one(".libelle").html(tag).toggleClass("new", !!isNew);
                    return clone;
                },
                show: function () {
                    var cloud = one("#cloud"), vis = cloud.isVisible();
                    return new Promise(function (resolve) {
                        if (one("#wa").isVisible() || !one("#collection").hasClass("active")) { resolve(); } else {
                            Windows.close().then(function () {
                                one("html").toggleClass("overflown", !vis);
                                if (!!vis) { cloud.fade(false).then(resolve); } else {
                                    cloud.fade(0.9).then(function () {
                                        if (!cloud.all("span").length) { Tags.generate(); }
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
                    console.debug(data);
                    _.assign(this, data);
                    if (!!this.picture && !!this.link) {
                        one("#picture").toggle(true).newElement("img", { src: this.picture, title: "Google+" }).setEvents("click", function () { window.open(current.link); });
                    }
                    all(".gSignIn").toggle(!!this.googleSignIn);
                    all(".noSignIn").toggle(!this.googleSignIn);
                    one(".noSignIn input").setAttributes("required", !this.googleSignIn);
                    if (this.first) { Windows.help(true); }
                    console.debug("current.initialize", new Date().toLocaleString());
                    return this;
                };
                User.prototype.addbook = function (book) {
                    if (this.bookindex(book.id) === -1) {
                        this.books.push(book);
                        this.books = _.sortBy(this.books, "title");
                    }
                    var cell = Bookcells.one(book.id);
                    if (!!cell) { cell.book = book; }
                    one("#nbBooks").text(this.books.length);
                };
                User.prototype.book = function (bookid) { return _.find(this.books, _.matchesProperty("id", bookid)); };
                User.prototype.bookindex = function (bookid) {
                    return _.findIndex(this.books, _.matchesProperty("id", bookid));
                };
                User.prototype.removebook = function (bookid) {
                    _.remove(this.books, _.matchesProperty("id", bookid));
                    return this.books.length;
                };
                User.prototype.updated = function (values) {
                    this.name = values.name;
                    this.googleSync = values.googleSync;
                    Windows.close();
                };
                User.prototype.updatebook = function (book) {
                    var index = this.bookindex(book.id);
                    _.assign(book, book.update);
                    delete book.update;
                    if (index !== -1) { _.assign(this.books[index], book); }
                    var bookcell = Bookcells.one(book.id);
                    if (!!bookcell && (!!book.title || !!book.authors || !!book.alternative)) {
                        if (!!book.title) { bookcell.cell.one("header").text(book.title); }
                        if (!!book.authors) { bookcell.cell.one("figcaption").text(book.authors.join(", ")); }
                        if (!!book.alternative) { bookcell.cell.one(".cover").src = book.alternative; }
                    }
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
                    return current.addbook(book);
                },
                collection: function () {
                    Windows.close();
                    one("@filtre").value = one("@last").value = one("#selectedTag").innerHTML = "";
                    if (!one("#collection").hasClass("active")) {
                        Bookcells.destroy();
                        Waiting.anim(true);
                        Waiting.toggle(true, true).then(function () {
                            one("#nvb").toggleClass("inactive", true);
                            Images.active.call(one("#collection"));
                            if (!!current.books.length) {
                                Bookcells.show(current.books).then(Search.endRequest);
                            } else { Search.endRequest(); }
                        });
                    } else {
                        window.scroll(0, 0);
                        all(".bookcell").toggleClass("tofilter tohide", false);
                        one("#sort [by]").trigger("click");
                    }
                    return false;
                },
                delete: function () {
                    one("#errPwd").toggle(false);
                    if (!one("@pwd").reportValidity()) { return; }
                    Windows.confirm("warning", one("#delete").getAttribute("confirm")).then(function () { socket.emit("deleteUser", one("@pwd").value); });
                    return false;
                },
                nokdated: function () {
                    one("#errPwd").toggle(true);
                    return false;
                },
                update: function () {
                    one("#errPwd").fade(false);
                    socket.emit("updateUser", this.serialize());
                    return false;
                }
            },
            Waiting = {
                anim: function (toShow) {
                    one("#wa").fade(toShow);
                },
                over: function (toShow) {
                    one("#w").toggleClass("over", toShow);
                },
                toggle: function (visible, withIcon) {
                    Waiting.p = new Promise(function (resolve) {
                        var wait = one("#w");
                        wait.one("img").toggle(!!withIcon);
                        if (wait.isVisible() === visible || !!Windows.on || !!Waiting.on) { resolve(); } else {
                            Waiting.on = true;
                            all(".description").removeAll();
                            if (!!visible) {
                                one("html").toggleClass("overflown", true);
                                wait.fade(0.5).then(resolve);
                            } else {
                                wait.fade(false).then(function () {
                                    one("html").toggleClass("overflown", false);
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
                    var noConnect = one("#noConnect"),
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
                        var win = all(".window:not(.notdisplayed)"), forms = all("form:not(#formFilter)");
                        Waiting.over(false);
                        if (one("#h").isVisible()) { Windows.help(false); }
                        µ.removeEventListener("keyup", shortCuts);
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
                        one("#confirmWindow header span").text(one("#confirmWindow header span").getAttribute(type));
                        one("#confirmWindow #confirm").text(msg);
                        all("#confirmWindow button").setEvents("click", Windows.close);
                        one("#confirmWindow .valid").setEvents("click", function () { resolve(); });
                        one("#confirmWindow .cancel").toggle(type === "warning").setEvents("click", function () { reject(); });
                        Waiting.toggle(true).then(function () {
                            one("#confirmWindow").css({ "top": xcroll().top + 10, "left": "25%" }).fade(true);
                            µ.setEvents({ "keyup keydown" : Window.esc });
                        });
                    });
                },
                esc: function (event) { if (event.keyCode === 27) { Windows.close(); } },
                help: function (toShow) {
                    if (toShow === one("#h").isVisible()) { return; }
                    if (typeof toShow !== "boolean") { toShow = !one("#h").isVisible(); }
                    if (!!toShow) {
                        Windows.close().then(function () {
                            one("html").toggleClass("overflown", true);
                            one("#h").toggle(true);
                        });
                    } else {
                        one("html").toggleClass("overflown", false);
                        one("#h").toggle(false);
                    }
                },
                open: function () {
                    var self = this;
                    return new Promise(function (resolve, reject) {
                        var wid = (typeof self === "string") ? self : self.getAttribute("window"), win = one("#" + wid);
                        if (!!Windows.on && Windows.on === wid) { Windows.close().then(resolve); } else {
                            if (one("#h").isVisible()) { Windows.help(false); }
                            Tags.close().then(function () {
                                if (one("#wa").isVisible()) { resolve(); }
                                if (!_.includes(["previewWindow", "recommandWindow"], wid)) { all(".window:not(.notdisplayed)").fade(false); }
                                if (wid === "profileWindow") {
                                    one("@mail").value = current.id;
                                    one("@name").value = current.name;
                                    if (!!current.googleSignIn) {
                                        one("@googleSignIn").setAttribute("checked", true);
                                        if (!!current.googleSync) { one("@googleSync").setAttribute("checked", true); }
                                    } else {
                                        one("@pwd").setAttribute("required", true);
                                    }
                                    if (!one(".changePwd.notdisplayed")) { Windows.togglePwd(); }
                                }
                                Waiting.toggle(true).then(function () {
                                    Windows.on = wid;
                                    win.css({ "top": xcroll().top + 10 }).fade(true);
                                    if (win.one("[autofocus]")) { win.one("[autofocus]").focus(); }
                                    resolve();
                                });
                                all(".errMsg").toggle(false);
                            });
                        }
                    });
                },
                togglePwd: function () {
                    all(".changePwd").fade().then(function (self) {
                        for (var jta = 0, lg = self.length; jta < lg; jta++) {
                            self[jta].all("[type=password]").setAttributes({ "required": self[jta].isVisible() });
                        }
                    });
                }
            },
            xcroll = function () { return { top: window.scrollY || µ.documentElement.scrollTop, left: window.scrollX || µ.documentElement.scrollLeft }; };

        Bookcell.prototype.active = function () {
            if (!!this.actived) { return; }
            var action = function () {
                    var type = this.classList;
                    self.cell.all("button").fade();
                    if (_.includes(type, "add")) { socket.emit("addBook", self.id); }
                    if (_.includes(type, "remove")) {
                        if (one("#collection").hasClass("active")) {
                            self.cell.fade().then(function () {
                                self.cell.removeAll();
                                Bookcells.loadcovers();
                            });
                        }
                        socket.emit("removeBook", self.id);
                        one("#nbBooks").text(current.removebook(self.id));
                        if (!!self.book.tags.length) { Tags.init(); }
                    }
                },
                description = function (event) {
                    if (!!event.relatedTarget && !event.relatedTarget.hasClass("description")) { all(".description").removeAll(); }
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
                    if (current.bookindex(self.id) !== -1 || !!self.opened) {
                        Detail.data = self;
                        Detail.show(current.bookindex(self.id) !== -1);
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

            this.cell.all("header, figure").setEvents("click", detail);
            this.cell.all("button").setEvents("click", action);
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

        µ.setEvents({ "keyup keydown": shortCuts, "scroll": Bookcells.loadcovers });
        all("input").setEvents("input propertychange", checkValid);
        one("#logout").setEvent("click", logout);
        all("#h button, #help").setEvents({ "click": Windows.help });
        one("#formSearch").setEvent("submit", Search.books);
        one("#formProfil").setEvent("submit", userActions.update);
        one("#formRecommand").setEvent("submit", Detail.sendNotif);
        one("#formTag").setEvent("submit", Tags.add);
        all("#formNew, #formFilter").setEvents("submit", function (event) { event.preventDefault(); });
        all("#formNew button").setEvents("click", Detail.modify);
        one("#changePwd").setEvent("click", Windows.togglePwd);
        one("#delete").setEvent("click", userActions.delete);
        one("#tris").setEvent("click", Menu.sort);
        one("#notifications").setEvent("click", Menu.notif);
        all("#sort > div").setEvents("click", Bookcells.sort);
        all("img[actclick]").setEvents({ mouseenter: Images.hover, mouseleave: Images.blur});
        all("[actclick]").setEvents("click", Detail.action);
        all(".closeWindow").setEvents("click", Windows.close);
        one("#footer").setEvent("click", Menu.top);
        all("#uploadHidden [type=file]").setEvents("change", Detail.uploadCover);
        all("#userNote > img").setEvents({ mouseenter: Detail.mouseNote, mouseleave: Detail.userNote, click: Detail.clickNote });
        all(".nvb > div:not(#picture):not(.filtre), img.closeWindow, #footer, [by], .imgAction img, #cloud img, #contactsWindow img, [nav]").setEvents({ mouseenter: Images.hover, mouseleave: Images.blur });
        (function (toblur) { for (var jta = 0, lg = toblur.length; jta < lg; jta++) { Images.blur.call(toblur[jta]); } })(all("[blur]"));
        all("img").setAttributes({ "draggable": false });
        one("#nvb").toggleClass("notdisplayed", false);
        one("#collection").setEvent("click", userActions.collection);
        all("#tags, #cloud > img").setEvents("click", Tags.show);
        all("#recherche, #profil, #contact").setEvents("click", Windows.open);
        one("#newbook").setEvent("click", Detail.new);
        all(".tnv").setEvents("click", Menu.toggle);
        all("[url]").setEvents("click", Menu.link);
        all("[mail]").setEvents("click", Menu.mail);
        one("#recommand4u").setEvent("click", Search.recommand);
        all("#importNow, #exportNow").setEvents("click", Search.gtrans);
        all("@tag").setEvents("input propertychange", Tags.list);
        window.setEvents({ "contextmenu": Menu.context, "resize": Dock.resize, "click": Menu.close, "selectstart": Menu.selectstart });
        all("[nav]").setEvents("click", Menu.nav);
        (function (search) {
            if (!!search) {
                one("@filtre").setEvent("search", Bookcells.filter);
            } else {
                one("#formFilter").setEvent("submit", function (event) {
                    Bookcells.filter.call(one("@filtre"));
                    return false;
                });
            }
        })("onsearch" in µ.createElement("input"));
    });
}
