if (!window.FileReader || !window.Promise || !("formNoValidate" in document.createElement("input"))) {
    alert(document.body.getAttribute("error"));
} else {
    var µ = document;
    µ.setEvents("DOMContentLoaded", function () {
        "use strict";
        var start = new Date();
        console.debug("µ.ready", start.toLocaleString());
        var so = io({ reconnection: true }),
            colorthief = new ColorThief(),
            xcroll = function () { return { top: window.scrollY || µ.documentElement.scrollTop, left: window.scrollX || µ.documentElement.scrollLeft }; },
            User = {
                init: function (data) {
                    if (!data.id) { return logout(); }
                    for (var jta in data) { this[jta] = data[jta]; }
                    if (!!this.picture && !!this.link) {
                        one("#picture").toggle(true).newElement("img", { src: this.picture, title: "Google+" }).setEvents("click", function () { window.open(User.link); });
                    }
                    if (!!this.googleSignIn) { all(".gSignIn").toggleClass("notdisplayed"); }
                    if (!!this.first) { one("#profileWindow").trigger("click"); }
                    Idb.init();
                    console.debug("User.initialize", new Date().toLocaleString(), (new Date() - start) / 1000);
                },
                delete: function () {
                    one("#errPwd").toggle(false);
                    if (!one("@pwd").reportValidity()) { return; }
                    Windows.confirm("warning", one("#delete").getAttribute("confirm")).then(function () {
                        so.emit("deleteUser", one("@pwd").value);
                    });
                    return false;
                },
                update: function () {
                    one("#errPwd").fade(false);
                    so.emit("updateUser", this.serialize());
                    return false;
                },
                updated: function (values) {
                    User.name = values.name;
                    User.googleSync = values.googleSync;
                    Windows.close();
                },
                nokdated: function () {
                    one("#errPwd").toggle(true);
                    return false;
                },
                book: function (bookid) { return _.find(this.books, _.matchesProperty("id", bookid)); },
                bookindex: function (bookid) { return _.findIndex(this.books, _.matchesProperty("id", bookid)); },
                addbook: function (book) {
                    if (User.bookindex(book.id) === -1) {
                        User.books.push(book);
                        User.books = _.sortBy(User.books, "title");
                    }
                    var cell = Bookcells.one(book.id);
                    if (!!cell) { cell.b = book; }
                    one("#nbBooks").html(User.books.length);
                },
                removebook: function (bookid) {
                    _.remove(this.books, _.matchesProperty("id", bookid));
                    return this.books.length;
                },
                updatebook: function (book) {
                    var index = User.bookindex(book.id);
                    if (!!book.update) { book = _.assign(book, book.update); }
                    delete book.update;
                    if (index !== -1) { this.books[index] = _.assign(this.books[index], book); }
                    var bookcell = Bookcells.one(book.id);
                    if (!!bookcell && !!bookcell.col && (!!book.title || !!book.authors || !!book.alternative)) {
                        if (!!book.title) { bookcell.c.one("header").html(book.title); }
                        if (!!book.authors) { bookcell.c.one("figcaption").html(book.authors.join(", ")); }
                        if (!!book.alternative) { bookcell.c.one(".cover").src = book.alternative; }
                    }
                },
                updatetags: function () {
                    this.tags = _.countBy(_.flatten(_.compact(_.pluck(this.books, "tags")), true).sort());
                    Tags.init();
                },
                destroy: function () {
                    for (var jta in this) { if (!_.isFunction(this[jta])) { delete this[jta]; }}
                },
                collection: function () {
                    Windows.close();
                    one("@filtre").value = one("#selectedTag").innerHTML = "";
                    one("@filtre").setAttribute("data-prec", "");
                    one("#tags").toggle(!_.isEmpty(User.tags));
                    all(".bookcell").toggleClass("tofilter tohide", false);
                    one("#nbBooks").html(User.books.length);
                    if (!one("#collection").hasClass("active")) {
                        Images.active.call(one("#collection"));
                        Bookcells.show(User.books, true);
                    } else {
                        Bookcells.display();
                        Search.endRequest(User.books.length);
                    }
                    return false;
                }
            },
            Dock = {
                nbcols: ~~(window.innerWidth / 256),
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
                                var cell = Bookcells.one(JSON.parse(event.dataTransfer.getData("cell"))).cell, target = event.target.closest("bookcell");
                                if (!!target) {
                                    if (cell !== target) {
                                        target.closest("col").insertBefore(cell, target);
                                        Bookcells.loadcovers();
                                        if (one(".sortBy")) { Images.blur.call(one(".sortBy").toggleClass("sortBy", false)); }
                                    }
                                } else {
                                    this.appendChild(cell);
                                }
                                return false;
                            }
                        });
                    }
                    return $dock;
                },
                remove: function () { if (!!one("#d")) { one("#d").removeAll(); }},
                resize: function() {
                    if (Dock.nbcols !== ~~(window.innerWidth / 256)) {
                        //Windows.close();
                        if (one("#detailWindow").isVisible()) { one("#detailWindow").css({ "height": ~~(window.innerHeight * 0.95), "max-height": ~~(window.innerHeight * 0.95) }); }
                        Tags.destroy();
                        all(".deroulant").fade(false);
                        Dock.nbcols = ~~(window.innerWidth / 256);
                        Dock.remove();
                        Bookcells.display();
                    } else {
                        all(".col").css({ "width": ~~(window.innerWidth / Dock.nbcols), "max-width": ~~(window.innerWidth / Dock.nbcols) });
                    }
                    return;
                }
            },
            Images = {
                hover: function () {
                    var image = this.tagName.toLowerCase() === "img" ? this : this.one("img");
                    if (!!this.hasClass("active") || !!this.hasClass("sortBy")) { return false; }
                    if (!!image) { image.src = images[image.getAttribute("source")][image.getAttribute("hover")]; }
                },
                blur: function () {
                    var image = this.tagName.toLowerCase() === "img" ? this : this.one("img");
                    if (!!this.hasClass("active") || !!this.hasClass("sortBy")) { return false; }
                    if (!!image) { image.src = images[image.getAttribute("source")][image.getAttribute("blur")];
                        if (!image.isVisible() && !image.hasClass("nsv")) { image.css({ visibility: "visible" }); }
                    }
                },
                active: function () {
                    var imgs = all(".active").toArray();
                    all(".active").toggleClass("active", false);
                    imgs.forEach(function (el) { Images.blur.call(el); });
                    this.toggleClass("active", true);
                    one("#tags").toggle(this.id === "collection" && !_.isEmpty(User.tags));
                    this.all("img").forEach(function () {
                        this.src = images[this.getAttribute("source")][this.getAttribute("active")];
                    });
                }
            },
            Menu = {
                show: function () {
                    Images.hover.call(one("#sort img"));
                    all("#tags, #notifications").toggle(false);
                },
                toggle: function () { all(".nvb").fade(function () { one("#d").css({ "padding-top": one("#nvb").isVisible() ? one("#nvb").clientHeight : 0 }); }); },
                notif: function (state) {
                    if (!!state) { one("#sort").fade(false); }
                    one("#notifs").css({ top: one("#nvb").clientHeight + 5, left: one("#notifications").offsetLeft });
                    one("#notifs").fade(0.95);
                },
                sort: function (state) {
                    var sorts = one("#sort");
                    if (!!state) { one("#notifs").fade(false); }
                    if (sorts.isVisible()) { sorts.fade(false); } else {
                        sorts.css({ top: one("#nvb").clientHeight + 5, left: one("#tris").offsetLeft }).fade(0.95);
                    }
                },
                link: function () { window.open(this.getAttribute("url")); },
                mail: function () { µ.location.href = "mailto:" + this.getAttribute("mail"); },
                context: function (event) {
                    event.preventDefault();
                    var ctx = one("#contextMenu");
                    if (one("#detailWindow").isVisible() && !one("#w").hasClass("over") && !_.isEmpty(Detail.data.book)) {
                        ctx.fade(true).css({
                            top: ((event.clientY + ctx.clientHeight > window.innerHeight) ? event.clientY - ctx.clientHeight : event.clientY),
                            left: ((event.clientX + ctx.clientWidth > window.innerWidth) ? event.clientX - ctx.clientWidth : event.clientX)
                        });
                    }
                    return false;
                },
                close: function (event) {
                    var closact = event.target.closest("action");
                    if (one("#contextMenu").isVisible() && !event.target.getAttribute("nav")) { one("#contextMenu").fade(false); }
                    if (!closact || !_.includes(["notifications", "tris"], closact.getAttribute("id"))) { all(".deroulant").fade(false); }
                },
                nav: function () {
                    if (!Detail.data.c) { return false; }
                    var cell = Detail.data.c, cells = cell.parentNode.all(".bookcell"), row = cell.index(), col = parseInt(cell.parentNode.getAttribute("colid"), 10);
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
                            if (!row && !col) { return false; }
                            if (!col) { col = Dock.nbcols; row--; }
                            col--;
                            break;
                        case "bottom":
                            if (row >= cells.length) { return false; }
                            row++;
                            break;
                    }
                    one("[colid='" + col + "']").childNodes[row].one(".cover").trigger("click");
                    return false;
                },
                selectstart: function (event) {
                    event.preventDefault();
                    if (!!event.target.tagName && !_.includes(["input", "textarea"], event.target.tagName.toLowerCase())) { return false; }
                },
                top: function () {
                    var timer = setInterval(function () {
                        var scr = (xcroll().top / 2).toFixed(1);
                        window.scroll(0, scr);
                        if (scr <= 0.1) { window.scroll(0, 0); clearInterval(timer); }
                    }, 100);
                }
            },
            Bookcells = {
                books: [], cells: [],
                add: function (books) {
                    Bookcells.cells = _.union(Bookcells.cells, _.isArray(books) ? books : [books] );
                },
                destroy: function () { Dock.remove(); Bookcells.books = []; Bookcells.cells = []; },
                one: function (bookid) { return _.find(Bookcells.cells, _.matchesProperty("id", bookid)); },
                show: function (books, empty) {
                    if (!!empty) { Bookcells.destroy(); }
                    var newCells = [];
                    if (!!Search.last) {
                        Bookcells.books.push(books);
                        Bookcells.books = _.flattenDeep(Bookcells.books);
                    }
                    for (var jta=0, lg = books.length; jta < lg; jta++) {
                        if (!!Bookcells.one(books[jta].id)) { continue; }
                        newCells.push(new Bookcell(User.book(books[jta].id) || books[jta]));
                    }
                    Bookcells.add(newCells);
                    Bookcells.display(newCells, true);
                    Waiting.toggle();
                },
                returned: function (book) { Bookcells.one(book.id).returned(book); },
                display: function (cells, toAdd) {
                    if (!cells && !!one(".sortBy")) { return Bookcells.sort.call(one(".sortBy")); }
                    cells = cells || _.sortBy(Bookcells.cells, function (cell) { return [ cell.row, cell.col ]; });
                    var $dock = Dock.get(), last = !!toAdd ? all(".bookcell [colid]").length : 0, indice = 0;
                    cells.forEach(function (bcell, index) {
                        var cell = bcell.cell;
                        bcell.col = (last + index) % Dock.nbcols;
                        bcell.row = Math.floor((last + index) / Dock.nbcols);
                        if (!!cell.hasClass("tohide") || !!cell.hasClass("tofilter")) {
                            $dock.one("section.notdisplayed").appendChild(cell);
                        } else {
                            cell.css({ "visibility" : "hidden" }).toggleClass("toshow", true);
                            one("[colid='"+ indice % Dock.nbcols +"']").appendChild(cell);
                            indice++;
                        }
                        cell.all("header, figure *:not(button)").setEvents("click", bcell.detail);
                        cell.all("button").setEvents("click", bcell.action);
                        cell.setEvents("mouseenter mouseleave", bcell.description);
                    });
                    Bookcells.loadcovers();
                },
                loadcovers: function () {
                    for (var jta = 0, lg = Bookcells.cells.length; jta < lg; jta++) { Bookcells.cells[jta].loadcover(); }
                    one("#footer").toggle(!!xcroll().top);
                },
                bytags: function (tag) {
                    one("#formFilter").reset();
                    all(".bookcell").toggleClass("tofilter", false);
                    one("#selectedTag").html(tag);
                    Bookcells.cells.forEach(function (cell) { cell.cell.toggleClass("tohide", !_.includes(cell.book.tags, tag)); });
                    Bookcells.display();
                },
                sort: function () {
                    if (!!one(".sortBy") && this !== one(".sortBy")) {
                        Images.blur.call(one(".sortBy").toggleClass("sortBy", false));
                        Images.hover.call(this.toggleClass("sortBy", true));
                    }
                    var tby = this.getAttribute("by"), sort = this.getAttribute("sort"), cells = _.sortBy(Bookcells.cells, function (cell) { return cell.book[tby] || null; });
                    if (!!sort) cells.reverse();
                    Bookcells.display(cells);
                },
                filter: function () {
                    var filtre = this.value.toLowerCase();
                    if (!!this.checkValidity() && filtre !== this.getAttribute("data-prec")) {
                        this.setAttribute("data-prec", filtre);
                        Bookcells.cells.forEach(function (cell) {
                            var title = cell.b.title.toLowerCase(),
                                subtitle = (!!cell.b.subtitle) ? cell.b.subtitle.toLowerCase() : "",
                                authors = (!!cell.b.authors) ? cell.b.authors.join(", ").toLowerCase() : "",
                                description = cell.b.description.toLowerCase();

                            cell.c.toggleClass("tofilter", title.indexOf(filtre) === -1 && subtitle.indexOf(filtre) === -1 && authors.indexOf(filtre) === -1 && description.indexOf(filtre) === -1);
                        });
                        Bookcells.display();
                    }
                }
            },
            Bookcell = function (book) {
                var self = this,
                    cell = one("#tempCell").cloneNode(true).removeAttributes("id").toggleClass("bookcell", true),
                    action = function () {
                        var type = this.classList;
                        cell.all("button").fade();
                        if (_.includes(type, "add")) { so.emit("addBook", book.id); }
                        if (_.includes(type, "remove")) {
                            if (one("#collection").hasClass("active")) {
                                cell.fade(function () {
                                    cell.removeAll();
                                    Bookcells.loadcovers();
                                });
                            }
                            so.emit("removeBook", book.id);
                            one("#nbBooks").html(User.removebook(book.id));
                        }
                    },
                    returned = function (book) {
                        self.book = book;
                        self.opened = true;
                        Detail.data = self;
                        Detail.show();
                        Idb.setDetail(book);
                    },
                    description = function (event) {
                        if (!!event.relatedTarget && !event.relatedTarget.hasClass("description")) { all(".description").removeAll(); }
                        if (event.type !== "mouseenter") { return; }
                        if (!book.description) {
                            return false;
                        } else {
                            var index = book.description.indexOf(" ", 500),
                                leave = function () { this.removeAll(); },
                                position = {
                                    "max-height": window.innerHeight,
                                    left: (Math.min(this.offsetLeft + (this.clientWidth / 3), window.innerWidth - (this.clientWidth * 1.333))).toFixed(0)
                                },
                                top = (this.offsetTop + (this.clientHeight / 3)).toFixed(0),
                                description = µ.body.newElement("div", { "width": this.clientWidth, "bookid": book.id, "class": "description notdisplayed" })
                                    .css({ "width": this.clientWidth })
                                    .setEvents("click", leave)
                                    .html("<span>" + book.title + "</span><BR>"+book.description.substr(0, Math.max(index, 500)) + ((index !== -1) ? "..." : ""));

                            if (top + description.clientHeight > µ.clientHeight) {
                                position.bottom = this.clientHeight * 0.333;
                            } else {
                                position.top =  top;
                            }
                            description.css(position);
                            setTimeout(function () { description.fade(0.9).setEvents("mouseleave", leave); }, 1000);
                        }
                    },
                    detail = function () {
                        if (User.bookindex(book.id) !== -1 || !!self.opened) {
                            Detail.data = self;
                            Detail.show(User.bookindex(book.id) !== -1);
                        } else {
                            Idb.getDetail(book.id).then(function (result) {
                                if (!!result) {
                                    Detail.data.book = result;
                                    Detail.show(false);
                                } else {
                                    Waiting.toggle(1, 1);
                                    so.emit("searchDetail", book.id);
                                }
                            });
                        }
                        return false;
                    },
                    loadcover = function () {
                        if (!cell.hasClass("toshow")) { return; }
                        var cover = cell.one(".cover");
                        if (!!cover && window.innerHeight + xcroll().top > cell.offsetTop) {
                            cell.toggleClass("toshow", false).css({ visibility: "visible" });
                            cell.setEvents({ dragstart: ds, dragend: de });
                            cell.one("footer").css({ "bottom": cell.one("figcaption").clientHeight + 5 });
                            if (!!book.alternative || !!book.base64) { cover.src = book.alternative || book.base64; }
                        }
                    },
                    ds = function (event) {
                        this.toggleClass("isDrag", true);
                        event.dataTransfer.effectAllowed = "move";
                        event.dataTransfer.dropEffect = "move";
                        event.dataTransfer.setData("cell", JSON.stringify(self.id));
                    },
                    de = function () {
                        this.toggleClass("isDrag", false);
                    };

                this.id = book.id;
                this.action = action;
                this.book = book;
                this.cell = cell;
                this.loadcover = loadcover;
                this.opened = false;
                this.returned = returned;
                this.detail = detail;
                this.description = description;
                cell.one("header").html(book.title);
                cell.one("figcaption").html(!!book.authors ? book.authors.join(", ") : "");
                cell.one(".previewable").toggle(!!book.access && book.access !== "NONE");
                cell.one(".personnal").toggle(_.isEqual(book.id.user, User.id));
                cell.one(".recommanded").toggle(!!book.from);
                cell.one(".add").toggle(User.bookindex(book.id) === -1);
                cell.one(".remove").toggle(User.bookindex(book.id) !== -1);
                return this;
            },
            Tags = {
                init: function () {
                    Tags.cloud = [];
                    all("#cloud span").removeAll();
                    var click = function () { Tags.show(); Bookcells.bytags(this.innerHTML = ""); Waiting.toggle(false); };
                    if (!!User.tags) {
                        var tagOptions = "";
                        _.forEach(User.tags, function (nb, tag) {
                            Tags.cloud.push({ "text": tag, "weight": nb });
                            tagOptions += "<option>" + tag + "</option>";
                        });
                        one("#tagsList").html(tagOptions);
                        Tags.cloud = _.sortBy(Tags.cloud, "weight").reverse();
                    }
                },
                generate: function () {
                    var cloud = one("#cloud"),
                        click = function () { Tags.show(); Bookcells.bytags(this.innerHTML); Waiting.toggle(false); },
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

                    _.forEach(Tags.cloud, function (tag, index) {
                        var µtag = cloud.newElement("span", { "title": tag.weight, "class": "tag tag" + Math.min(~~(tag.weight / 5) + 1, 10) }).html(tag.text),
                            top = height - (µtag.clientHeight / 2),
                            left = width - (µtag.clientWidth / 2),
                            radius = 0,
                            angle = 6.28 * Math.random();

                        µtag.css({ top: top, left: left });
                        while(isOver(µtag, µtags)) {
                            radius += step;
                            angle += (index % 2 === 0 ? 1 : -1) * step;
                            top = height + radius * Math.sin(angle) - (µtag.clientHeight / 2.0);
                            left = width - (µtag.clientWidth / 2.0) + (radius * Math.cos(angle)) * ratio;
                            µtag.css({ top: top, left: left });
                        }
                        µtags.push(µtag);
                    });
                    cloud.all("span").setEvents("click", click);
                },
                show: function () {
                    if (one("#wa").isVisible() || !one("#collection").hasClass("active")) { return false; }
                    Windows.close(function () {
                        var cloud = one("#cloud"), vis = cloud.isVisible();
                        all("html").toggleClass("overflown", !vis);
                        if (!!vis) { cloud.fade(false); } else {
                            cloud.fade(0.8, function (elt) {
                                if (!!cloud.all("span").length) { return false; }
                                Tags.generate();
                            });
                        }
                    });
                },
                close: function () { if (one("#cloud").isVisible()) { Tags.show(); }},
                destroy: function () {
                    Tags.close();
                    all("#cloud span").removeAll();
                },
                add: function (event) {
                    event.preventDefault();
                    var tag = this.formToJson().tag.toLowerCase(),
                        tags = all("#userTags > div").toArray(),
                        exist = _.find(tags, function (elt) { return elt.one(".libelle").html() === tag; });

                    if (!exist) {
                        tags.push(Tags.new(tag, true));
                        tags = _.sortBy(tags, function (tag) { return tag.one(".libelle").html(); });
                        tags.forEach(function (n) { one("#userTags").appendChild(n); });
                    }
                    this.reset();
                    return false;
                },
                new: function (tag, isNew) {
                    var clone = one("#tempTag").cloneNode(true);
                    clone.removeAttribute("id");
                    clone.setEvent("click", function (event) {
                        if (event.target.hasClass("libelle")) {
                            Windows.close();
                            Bookcells.bytags(event.target.html());
                        } else {
                            this.fade(false, function () { clone.removeAll(); one("#detailWindow [autofocus]").focus(); });
                        }
                    });
                    clone.one(".libelle").html(tag).toggleClass("new", !!isNew);
                    return clone;
                },
                list: function () { one("[name=tag]").setAttributes({ "list": !!this.value ? "tagsList" : "none" });}
            },
            Notifs = {
                show: function (list) {
                    var notifs = [];
                    if (!!list) { Notifs.list = list; }
                    all("#notifications, #notifNumber").toggle(!!Notifs.list.length);
                    one("#notifNumber").html(Notifs.list.length);
                    for (var jta = 0, lg = Notifs.list.length; jta < lg; jta++) {
                        var notif = one("#tempNotif").cloneNode(true);
                        notif.setAttributes({ notif: JSON.stringify(N.list[jta]) }).removeAttribute("id");
                        one("#notifName").html(Notifs.list[jta].from);
                        one("#notifTitle").html(Notifs.list[jta].title);
                        notif.setEvents("click", Notifs.click);
                        one("#notifs").appendChild(notif);
                    }
                },
                click: function () {
                    var self = this,
                        notif = JSON.parse(self.getAttribute("notif")),
                        bookid = notif._id.book;

                    _.remove(Notifs.list, notif);
                    Notifs.last = notif;
                    one("#notifs").toggle(function () { self.removeAll(); });
                    all("#notifications, #notifNumber").toggle(!!Notifs.list.length);
                    one("#notifNumber").html(Notifs.list.length);
                    Waiting.toggle(1, 1);
                    so.emit("readNotif", notif);
                }
            },
            Idb = {
                init: function () {
                    Idb.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
                    return new Promise(function (resolve, reject) {
                        if (!!Idb.indexedDB) {
                            var request = indexedDB.open(User.session, 1);
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
                getQuery: function (key) {
                    return new Promise(function (resolve, reject) {
                        if (!Idb.db) { reject(); }
                        var request = Idb.db.transaction(["queries"], "readwrite").objectStore("queries").index("by_query").get(JSON.stringify(key));
                        request.onsuccess = function () { if (!!this.result && !!this.result.books.length) { resolve(this.result.books); } else { reject(); }};
                        request.onerror = reject;
                    });
                },
                setQuery: function (key, value) {
                    if (!Idb.db) { return; }
                    var request = Idb.db.transaction(["queries"], "readwrite").objectStore("queries").put({ "query": JSON.stringify(key), "books": value });
                },
                deleteQuery: function (key) {
                    if (!Idb.db) { return; }
                    Idb.db.transaction(["queries"], "readwrite").objectStore("queries").delete(key);
                },
                getDetail: function (bookid) {
                    return new Promise(function (resolve, reject) {
                        if (!Idb.db) { reject(); }
                        var request = Idb.db.transaction(["details"], "readwrite").objectStore("details").index("by_id").get(bookid);
                        request.onsuccess = function () { if (!!this.result) { resolve(this.result); } else { resolve(); }};
                        request.onerror = function () { resolve(); };
                    });
                },
                setDetail: function (book) {
                    if (!Idb.db) { return; }
                    var request = Idb.db.transaction(["details"], "readwrite").objectStore("details").put(book);
                },
                deleteDetail: function (bookid) {
                    if (!Idb.db) { return; }
                    Idb.db.transaction(["details"], "readwrite").objectStore("details").delete(bookid);
                }
            },
            Search = {
                books: function (event) {
                    event.preventDefault();
                    Search.clear();
                    var val = this.formToJson(), stored;
                    Search.last = { q: val.searchby + val.searchinput, langRestrict: val.langage };
                    one("@filtre").setAttributes("data-prec", "").value = "";
                    Windows.close(function () {
                        Waiting.toggle(1, 1).then(function () {
                            Idb.getQuery(Search.last).then(Bookcells.show, function () {
                                one("#nvb").toggleClass("inactive", true);
                                Waiting.anim(true);
                                so.emit("searchBooks", Search.last);
                            });
                        });
                    });
                    return false;
                },
                recommand: function () {
                    Search.clear();
                    Search.last = { "recommand": User.id };
                    Windows.close(function () {
                        Waiting.toggle(1, 1);
                        Idb.getQuery(Search.last)
                            .then(Bookcells.show)
                            .catch(function () {
                                one("#nvb").toggleClass("inactive", true);
                                Waiting.anim(true);
                                so.emit("recommanded");
                            });
                    });
                },
                associated: function (bookid) {
                    Search.clear();
                    Search.last = { "associated": bookid };
                    Windows.close(function () {
                        Waiting.toggle(1, 1);
                        Idb.getQuery(Search.last)
                            .then(Bookcells.show, function () {
                                one("#nvb").toggleClass("inactive", true);
                                Waiting.anim(true);
                                so.emit("associated", bookid);
                            });
                    });
                },
                gtrans: function () {
                    var action = this.id;
                    Windows.confirm("warning", "Cette opération va importer/exporter vos EBooks depuis/vers votre bibliothèque Google.<BR>Etes vous sur de vouloir continuer?")
                        .then(function () {
                            if (action === "exportNow") { return so.emit("exportNow"); }
                            Bookcells.destroy();
                            Images.active.call(one("#collection"));
                            one("#nvb").toggleClass("inactive", true);
                            Waiting.anim(true);
                            Windows.close(function () {
                                Waiting.toggle(1, 1);
                                so.emit("importNow");
                            });
                        });
                },
                clear: function () {
                    Bookcells.destroy();
                    Dock.remove();
                    Images.active.call(one("#recherche"));
                    one("#selectedTag").html("");
                },
                endRequest: function (nb) {
                    one("#nvb").toggleClass("inactive", false);
                    Waiting.anim(false);
                    if (!nb) { Waiting.toggle(); }
                    if (!!Search.last) { Idb.setQuery(Search.last, Bookcells.books); }
                    console.debug("Search.endRequest", new Date().toLocaleString(), nb, Bookcells.cells.length);
                }
            },
            logout = function () {
                User.destroy();
                Bookcells.destroy();
                so.close();
                if (!!Idb.indexedDB) {
                    Idb.indexedDB.deleteDatabase(User.id);
                }
                return window.location.assign("/logout");
            },
            checkValid = function () {
                var n;
                this.setCustomValidity("");
                switch (this.name) {
                case "searchinput":
                    n = (this.value.length < 3);
                    break;
                case "filtre":
                    n = (!!this.value.length && this.value.length < 3);
                    break;
                case "name":
                    n = (this.value.length < 4);
                    break;
                case "pwd":
                    n = (this.value.length < 4 || this.value.length > 12);
                    break;
                case "newPwd":
                    n = (this.value.length < 4 || this.value.length > 12);
                    break;
                case "confirmPwd":
                    n = (this.value !== one("[name=newPwd]").value);
                    break;
                case "recommand":
                    n = (this.value.toLowerCase() === User.id);
                    break;
                case "title":
                    n = (this.value.length < 6);
                    break;
                }
                if (!!n) { this.setCustomValidity(this.getAttribute("error")); }
                return;
            },
            Windows = {
                open: function () {
                    var self = this;
                    return new Promise(function (resolve, reject) {
                        var wid = (typeof self === "string") ? self : self.getAttribute("window"), win = one("#" + wid);
                        Tags.close();
                        if (one("#wa").isVisible()) { resolve(); }
                        if (!_.includes(["previewWindow", "recommandWindow"], wid)) { all(".window:not(.notdisplayed)").fade(false); }
                        if (wid === "profileWindow") {
                            one("@mail").value = User.id;
                            one("@name").value = User.name;
                            if (!!User.googleSignIn) {
                                one("@googleSignIn").setAttribute("checked", true);
                                if (!!User.googleSync) { one("@googleSync").setAttribute("checked", true); }
                            } else {
                                one("@pwd").setAttribute("required", true);
                            }
                            if (!!all(".changePwd input[required=true]").length) { Windows.togglePwd(); }
                        }
                        Waiting.toggle(1).then(function () {
                            Windows.on = true;
                            win.css({ "top": xcroll().top + 10 }).fade(true);
                            if (win.one("[autofocus]")) { win.one("[autofocus]").focus(); }
                            resolve();
                        });
                        all(".errMsg").toggle(false);
                    });
                },
                close: function (callback) {
                    var windows = all(".window:not(.notdisplayed)");
                    if (!windows.length) { if (_.isFunction(callback)) { return callback.call(); }}
                    Waiting.over(false);
                    µ.removeEventListener("keyup", shortCuts);
                    all("[note]").forEach(Images.blur);
                    windows.forEach(function () { this.fade(false, function () { if (_.isFunction(callback)) { callback.call(); } else { Waiting.toggle(); }}); });
                    _.forEach(all("form"), function (form) { form.reset(); });
                    delete Windows.on;
                },
                confirm: function (type, msg) {
                    return new Promise(function (resolve, reject) {
                        Waiting.over();
                        one("#confirmWindow header span").html(one("#confirmWindow header span").getAttribute(type));
                        one("#confirmWindow #confirm").html(msg);
                        all("#confirmWindow button").setEvents("click", Windows.close);
                        one("#confirmWindow .valid").setEvents("click", function () { resolve(); });
                        one("#confirmWindow .cancel").toggle(type === "warning").setEvents("click", function () { reject(); });
                        Waiting.toggle(1).then(function () {
                            one("#confirmWindow").css({ "top": xcroll().top + 10, "left": "25%" }).fade(true);
                            µ.setEvents({ "keyup keydown" : Window.esc });
                        });
                    });
                },
                esc: function (event) { if (event.keyCode === 27) { Windows.close(); } },
                togglePwd: function () {
                    all(".changePwd").fade(function (self) { self.forEach(function (elt) { elt.all("[type=password]").setAttributes({ "required": elt.isVisible() }); }); });
                }
            },
            Detail = {
                data: {},
                action: function () {
                    var bookid = Detail.data.book.id, index = User.bookindex(bookid), book, actclick = this.getAttribute("actclick");
                    if (index !== -1) { book = User.books[index]; }
                    this.add = function () {
                        if (!bookid) {
                            var newbook = one("#formNew").formToJson(), error;
                            all("#formNew input, #formNew textarea").forEach(function () { if (!this.reportValidity()) { error = true; } });
                            newbook.authors = !!newbook.authors ? newbook.authors.split(",") : [];
                            for (var jta = 0, lg = newbook.authors.length; jta < lg; jta++) { newbook.authors[jta] = newbook.authors[jta].ns(); }
                            if (!!error) { return false; }
                            Waiting.over();
                            so.emit("newbook", newbook);
                        } else {
                            so.emit("addDetail");
                            Detail.newCell();
                        }
                    };
                    this.associated = function () {
                        Search.associated(bookid);
                    };
                    this.update = function () {
                        var update = false,
                            values = { id: bookid },
                            tags = _.map(all("#userTags > div").toArray(), function (tag) { return tag.one(".libelle").html(); }),
                            note = one("#userNote").value,
                            comment = one("#userComment").value,
                            maincolor = one("#detailCover").getAttribute("maincolor"),
                            alternative = one("#detailCover").getAttribute("src");

                        if (_.isObject(bookid) && bookid.user === User.id) {
                            var formValues = one("#formNew").formToJson();
                            formValues.authors = formValues.authors.split(",") || [];
                            //formValues.authors.forEach(function (val, index) { formValues.authors[index] = val.ns(); });
                            _.forEach(formValues, function (val, key) {
                                if (!_.isEqual(book[key], val)) {
                                    update = true;
                                    if (!values.update) { values.update = {}; }
                                    values.update[key] = val.ns();
                                }
                            });
                        }
                        if (!!note && note !== book.userNote) { update = true; values.userNote = note; }
                        if (!!comment && comment !== book.userComment) {
                            update = true;
                            values.userComment = comment;
                        }
                        if (!book.tags.length && !!tags.length || !_.isEqual(tags, book.tags)) {
                            update = "tags";
                            values.tags = tags;
                        }
                        if (!!maincolor && book.alternative !== alternative) {
                            update = true;
                            values.alternative = alternative;
                            values.maincolor = maincolor;
                        }
                        if (!!update) {
                            values.userDate = new Date().toJSON();
                            so.emit("updateBook", values);
                            User.updatebook(values);
                            User.updatetags();
                            one("#tags").toggle(!_.isEmpty(User.tags) && one("#collection").hasClass("active"));
                        }
                        Windows.close();
                    };
                    this.upload = function () {
                        one("#uploadHidden [type=file]").trigger("click");
                    };
                    this.preview = function () {
                        one("[name=previewid]").value = bookid;
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
                        this.closest("window").fade(false, function () { Waiting.over(false); });
                    };
                    this[actclick].call(this);
                },
                newCell: function () {
                    all("[actclick=add], [actclick=update], #upload, .inCollection").toggle();
                    var cell = Bookcells.one(Detail.data.book.id);
                    if (one("#collection").hasClass("active") && !cell) {
                        var col = User.books.length % Dock.nbcols,
                            row = all("[colid=" + User.books.length % Dock.nbcols + "] .bookcell").length;

                        cell = _.extend({ col: col, row: row }, new B(Detail.data.book));
                        Bookcells.add(cell);
                        Bookcells.display();
                    }
                    if (!!cell && !!cell.c) { cell.cell.all("button").fade(); }
                    User.addbook(Detail.data.book);
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
                clickNote: function () {
                    var userNote = one("#userNote"), $note = this.getAttribute("note");
                    if (userNote.value === $note && userNote.value === "1") {
                        userNote.value = 0;
                    } else {
                        userNote.value = $note;
                    }
                    Detail.userNote();
                },
                links: function () {
                    var sb = this.getAttribute("searchby"), txt = this.html();
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
                                    this.toggleClass("new", true).setAttribute("maincolor", mainColor.hex);
                                    one("#detailContent").css("background", "radial-gradient(whitesmoke 40%, " + mainColor.hex + ")");
                                };
                                image.src = e.target.result;
                            };
                        })(one("#detailCover"));
                        reader.readAsDataURL(this.files[0]);
                    }
                },
                sendNotif: function (event) {
                    event.preventDefault();
                    var val = this.formToJson();
                    val.book = Detail.data.book.id;
                    val.title = Detail.data.book.title;
                    if (!!Detail.data.book.alt) { val.alt = Detail.data.book.alt; }
                    so.emit("sendNotif", val);
                    one("#recommandWindow img").trigger("click");
                    return false;
                },
                modify: function () {
                    if (!!this.hasClass("modify")) {
                        if (this.hasClass("hide")) { this.siblings("[name]").forEach(function () { this.value = this.getAttribute("oldvalue"); }); }
                        this.toggleClass("hide");
                        this.siblings("[field]:not(.noValue), [name]").toggle(null);
                        var input = this.siblings("[name]")[0];
                        input.focus();
                        if (input.tagName.toLowerCase() === "textarea") { input.scrollTop = 0; }
                    }
                    return;
                },
                new: function () {
                    Detail.data.book = {};
                    Detail.show(false);
                    one("#formNew").reset();
                    all("#formNew input, #formNew textarea, .volumeInfo:not(.nonEditable), .volumeInfo:not(.nonEditable) button").toggle(true);
                    all("#formNew [field]").toggle(false);
                },
                show: function (inCollection) {
                    var book = Detail.data.book, win = one("#detailWindow");
                    win.all("#formNew input, #formNew textarea").toggle(false);
                    win.all("#formNew button:not(.categories)").toggleClass("hide", false).toggleClass("modify", !!book.id && _.isEqual(book.id.user, User.id));
                    win.one("#detailWindow [type=file]").value = "";
                    one("#comments").children.removeAll();
                    win.css({ "background": "whitesmoke", "max-height": ~~(window.innerHeight * 0.95) });
                    one("#userNote").value = book.note;
                    win.all("#detailWindow .new").toggleClass("new", false);
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
                    one("#detailCover").src = book.alternative || book.base64|| images["book-4-icon"].black;
                    win.all(".direct").html("");
                    win.all("#userTags > div").removeAll();
                    win.one("#detailWindow .windowheader span").html(book.title || one("#detailWindow .windowheader span").getAttribute("label"));
                    all("[actclick=add]").toggle(!inCollection);
                    all("[actclick=update]").toggle(!!inCollection);
                    all("[actclick=recommand]").toggle(!!inCollection);
                    all("[actclick=associated]").toggle(!!book.id && !_.isObject(book.id));
                    all("[actclick=preview]").toggle(!!book.access && book.access !== "NONE");
                    all("[actclick=google]").setAttributes({ "link": book.link }).toggle(!!book.link);
                    all("[actclick=upload]").toggle(!book.base64 && !book.cover && !!inCollection);
                    win.all(".comments").toggle(!!book.comments && !!book.comments.length);
                    win.all("#detailWindow [field]").toggleClass("noValue", false);
                    win.all("[field=authors] span").removeAll();
                    win.all(".volumeInfo").toggle(false);
                    Detail.userNote();
                    if (!!win.hasClass("notdisplayed")) { Windows.open.call("detailWindow"); }
                    _.forEach(book, function (value, jta) {
                        var field = win.one("[field=" + jta + "]"), input = win.one("[name=" + jta + "]");
                        if (!!field && jta !== "subtitle") {
                            field.closest("volumeInfo").toggle(!!value || _.isEqual(book.id.user, User.id));
                            field.toggle(!!value).toggleClass("noValue", !value);
                        }
                        switch (jta) {
                            case "authors":
                                value.forEach(function (aut) { field.newElement("span", { "class": "link", "searchby": 3 }).html(aut); });
                                input.value = value.join(", ");
                                input.setAttribute("oldvalue", value.join(", "));
                                field.parentNode.all("button").toggle(!!value.length);
                                break;
                            case "tags":
                                var userTags = one("#userTags");
                                value.forEach(function (tag) { userTags.appendChild(Tags.new(tag)); });
                                break;
                            case "userNote":
                                Detail.clickNote.call(one("[note='" + value + "']"));
                                break;
                            case "userComment":
                                one("#userComment").value = value;
                                break;
                            case "comments":
                                var mNote, cNotes = 0;
                                if (!value.length) { win.one(".comments").toggle(false); }
                                value.forEach(function (com) {
                                    if (!!com.comment) {
                                        var comment = one("#tempComment").cloneNode(true);
                                        comment.removeAttribute("id");
                                        comment.one(".commentAuthor").html(com.name);
                                        comment.one(".commentDate").html(com.date.fd());
                                        comment.one(".commentNote").html(com.note);
                                        comment.one(".commentComment").html(com.comment);
                                        one("#comments").appendChild(comment);
                                    }
                                    if (!!com.note) {
                                        mNote = (mNote || 0) + parseInt(com.note, 10);
                                        cNotes++;
                                    }
                                });
                                if (typeof mNote !== "undefined" && !!cNotes) {
                                    mNote = (mNote / cNotes).toFixed(2);
                                    one(".subtitle").toggle(true);
                                    one("#mNote").html(mNote);
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
                                field.html(value);
                                break;
                        }
                    });
                    all(".link").setEvents("click", Detail.links, false);
                }
            },
            Waiting = {
                toggle: function (visible, withIcon) {
                     Waiting.p = new Promise(function (resolve) {
                        var wa = one("#w");
                        wa.one("img").toggle(!!withIcon);
                        if (!!Windows.on || !!Waiting.on || visible === wa.isVisible()) { resolve(); } else {
                            Waiting.on = true;
                            all(".description").removeAll();
                            if (!!visible) {
                                all("html").toggleClass("overflown", true);
                                wa.fade(0.5, resolve);
                            } else {
                                wa.fade(false, function () {
                                    all("html").toggleClass("overflown", false);
                                    Waiting.over(false);
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
                anim: function (toShow) {
                    one("#wa").fade(toShow);
                },
                over: function (toShow) {
                    one("#w").toggleClass("over", toShow);
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
                        }
                        if (action) { return false; }
                    }
                }
            };

        so.on("reconnect", function () {
            console.debug("so.reconnect", so.connected, new Date().toLocaleString());
            so.io.reconnect();
        }).on("connect", function () {
            so.emit("isConnected");
            console.debug("so.connect", new Date().toLocaleString());
        }).on("disconnect", function () {
            console.debug("so.disconnect", new Date().toLocaleString());
            User.destroy();
            Windows.close();
            Waiting.toggle(1, 1);
            all(".deroulant").toggle(false);
            Bookcells.destroy();
        }).on("error", function (error) { console.error(error); })
        .on("user", function (ret) {
            Menu.show();
            User.init(ret);
        }).on("collection", function (ret) {
            User.books = ret.books;
            console.debug("User.books", new Date().toLocaleString(), User.books.length);
            Notifs.show(ret.notifs);
            Tags.init();
            one("#collection").trigger("click");
            console.debug("so.collection", new Date().toLocaleString(), (new Date() - start) / 1000);
        }).on("books", Bookcells.show)
        .on("endRequest", Search.endRequest)
        .on("returnAdd", User.addbook)
        .on("returnDetail", Bookcells.returned)
        .on("logout", logout)
        .on("updateOk", User.updated)
        .on("updateNok", User.nokdated)
        .on("error", function (error) { console.warn(error); })
        .on("returnNotif", function (notif) {
            Detail.bookid = notif.id;
            Detail.data = { book: notif };
            Detail.show(User.bookindex(notif.id) !== -1);
        }).on("newbook", function (data) {
            Detail.bookid = data.id;
            Detail.data = { book: data };
            Detail.newCell();
            Detail.show(true);
            Waiting.over(false);
        }).on("covers", function (covers) {
            for (var jta = 0, lg = covers.length; jta < lg; jta++) {
                var cover = covers[jta], book = User.books[cover.index], cell = Bookcells.cells[cover.index].cell;
                book.base64 = cover.base64;
                if (!cell.hasClass("toshow")) { cell.one(".cover").src = cover.base64; }
                if (!!Detail.data.book && Detail.data.book.id === book.id) { one("#detailCover").src = cover.base64; }
            }
            console.debug("so.covers", new Date().toLocaleString(), (new Date() - start) / 1000);
        });

        µ.setEvents({ "keyup keydown": shortCuts, "scroll": Bookcells.loadcovers });
        all("input").setEvents("input propertychange", checkValid);
        one("#logout").setEvent("click", logout);
        one("#formSearch").setEvent("submit", Search.books);
        one("#formProfil").setEvent("submit", User.update);
        one("#formRecommand").setEvent("submit", Detail.sendNotif);
        one("#formTag").setEvent("submit", Tags.add);
        one("#formNew").setEvent("submit", function (event) { event.preventDefault(); });
        one("#formFilter").setEvent("submit", function (event) { event.preventDefault(); });
        all("#formNew button").setEvents("click", Detail.modify);
        one("#changePwd").setEvent("click", Windows.togglePwd);
        one("#delete").setEvent("click", User.delete);
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
        all("[blur]").forEach(Images.blur);
        all("img").setAttributes({ "draggable": false });
        one("#nvb").toggleClass("notdisplayed", false);
        one("#collection").setEvent("click", User.collection);
        all("#tags, #cloud > img").setEvents("click", Tags.show);
        all("#recherche, #profil, #contact").setEvents("click", Windows.open);
        one("#newbook").setEvent("click", Detail.new);
        all("@filtre").setEvents("search", Bookcells.filter);
        all(".tnv").setEvents("click", Menu.toggle);
        all("[url]").setEvents("click", Menu.link);
        all("[mail]").setEvents("click", Menu.mail);
        one("#recommand4u").setEvent("click", Search.recommand);
        all("#importNow, #exportNow").setEvents("click", Search.gtrans);
        all("@tag").setEvents("input propertychange", Tags.list);
        window.setEvents({ "contextmenu": Menu.context, "resize": Dock.resize, "click": Menu.close, "selectstart": Menu.selectstart });
        all("[nav]").setEvents("click", Menu.nav);
    });
}
