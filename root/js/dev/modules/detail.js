(function () {
    var app = angular.module("detail", ["search"]);
    app.directive("detail", function () {
        return {
            restrict: "A",
            templateUrl: "./html/detail.html",
            controller: ["$scope", "$socket", "$idb", "$thief", function (scope, socks, idb, thief) {
                var detail = scope.detail = {},
                    context = scope.context = {},
                    preview = scope.preview = {},
                    getMainColor = function (image) {
                        var rgbColor = thief.getColor(image),
                            hexColor = "#" + ((1 << 24) + (rgbColor[0] << 16) + (rgbColor[1] << 8) + rgbColor[2]).toString(16).substr(1);

                        return { "rgb": rgbColor, "hex": hexColor};
                    };

                detail.editToggle = function (element) {
                    this.edit[element] = !!this.edit.able ? !this.edit[element] : false;
                };
                detail.addBook = function () {
                    if (!this.edit.new) { return scope.bookcells.addBook(this.book); }
                    socks.emit("newbook", this.book);
                    this.edit.new = false;
                };
                detail.plusUn = function () {
                    console.debug("this.book.id", this.book.id);
                    socks.emit("addMoment", this.book.id);
                };
                detail.updateBook = function () {
                    scope.windows.close("detail");
                    if (!angular.equals(new Date(this.book.publishedDate), this.XDate)) { this.book.publishedDate = this.XDate; }
                    if (!angular.equals(this.ref, this.book)) {
                        var diffs = {}, cell = _.find(scope.bookcells.cells, _.matchesProperty("id", this.ref.id));
                        _.forEach(this.book, function (value, key) { if (!_.isEqual(value, detail.ref[key])) { diffs[key] = value; }});
                        _.assign(this.ref, this.book);
                        if (cell) { _.assign(cell, this.book); }
                        if (!!diffs.userComment) { this.book.userDate = diffs.userDate = new Date(); }
                        socks.emit("updateBook", _.merge(diffs, { "id": this.book.id }));
                        if (!!diffs.tags) { scope.tags.init(); }
                    }
                };
                detail.searchBy = function (evt) {
                    scope.search.result = { "by": evt.target.getAttribute("searchby"), "search": evt.target.html(), lang: "fr" };
                    scope.search.send();
                };
                detail.uploadCover = function () { µ.one("[type=file]").trigger("click"); };
                detail.prepare = function (index) {
                    var cell = scope.bookcells.cells[index],
                        book = _.find(scope.bookcells.collection, _.matchesProperty("id", cell.id));

                    _.assign(scope.waiting, { screen: true, icon: true });
                    if (!book && !cell.updated) {
                        idb.getDetail(cell.id).then(function (result) {
                            if (!!result) {
                                _.assign(cell, result);
                                detail.show(result);
                                scope.$apply();
                            } else { socks.emit("searchDetail", cell.id); }
                        });
                    } else {
                        detail.show(book || cell);
                    }
                };

                detail.setBack = function () {
                    if (!!detail.book.alternative || !!detail.book.base64) {
                        var backColor = getMainColor(µ.one("#detailCover")).hex;
                        µ.one("[detail]").css(
                            { "background": "radial-gradient(circle at 50%, whitesmoke 0%, " + backColor + " 100%)" }
                        );
                    }
                };

                detail.show = function (data) {
                    detail.reset();
                    if (!data.alternative && !data.base64) {
                        µ.one("[detail]").css({ "background": "radial-gradient(circle at 50%, whitesmoke 0%, #909090 100%)" });
                    }
                    scope.waiting.icon = false;
                    detail.ref = data;
                    detail.book = angular.copy(data);
                    detail.XDate = detail.book.publishedDate ? new Date(detail.book.publishedDate) : null;
                    detail.edit.able = _.isPlainObject(detail.book.id) && detail.book.id.user === scope.profile.user.id;
                    if (_.isEmpty(detail.book)) { _.assign(detail.edit, { "able": true, "new": true }); }
                    scope.windows.open("detail").then(function () {
                        detail.height = µ.one("[detail]").clientHeight - µ.one("[detail] header").clientHeight;
                        µ.one(".detailBook").scrollTop = 0;
                    });
                };

                detail.reset = function () {
                    delete this.ref;
                    delete this.book;
                    this.edit = { "able": false, "new": false };
                    this.tag = null;
                    if (µ.alls(".new")) { µ.alls(".new").toggleClass("new", false); }
                };

                detail.parseAuthors = function () {
                    this.book.authors = _.uniq(this.book.authors.noSpace().split(","));
                };

                detail.addTag = function () {
                    if (!this.book.tags) { this.book.tags = []; }
                    if (this.book.tags.indexOf(this.tag) === -1) {
                        this.book.tags.push(this.tag);
                        this.book.tags.sort();
                    }
                    this.tag = null;
                };

                detail.byTag = function (index) {
                    if (!scope.navbar.isCollect) { return; }
                    scope.tags.search(detail.book.tags[index]);
                    scope.waiting.screen = scope.waiting.over = false;
                };

                detail.removeTag = function (index) {
                    _.pullAt(this.book.tags, index);
                };

                detail.recommand = function () {
                    scope.windows.close("recommand");
                    socks.emit("sendNotif", { "recommand": this.recommandTo, "id": scope.detail.book.id });
                    this.recommandTo = null;
                };

                detail.noSpace = function (field) {
                    this.book[field] = this.book[field].noSpace();
                };

                preview.open = function () {
                    µ.one("[target]").submit();
                    scope.windows.open("preview");
                };

                socks.on("returnDetail", function (book) {
                    var cell = _.find(scope.bookcells.cells, _.matchesProperty("id", book.id));
                    if (!!cell) {
                        cell.updated = true;
                        _.assign(cell, book);
                    }
                    idb.setDetail(book);
                    scope.detail.show(book);
                });

                socks.on("returnNotif", function (book) {
                    var cell = _.find(scope.bookcells.cells, _.matchesProperty("id", book.id));
                    if (!!cell) {
                        cell.updated = true;
                        _.assign(cell, book);
                    }
                    scope.detail.show(book);
                    idb.setDetail(book);
                });

                socks.on("newbook", function (book) {
                    _.assign(detail.book, book);
                    detail.book.new = true;
                    scope.bookcells.addBook(detail.book);
                });

                angular.element(µ.one("[detail] article")).on("contextmenu", function (event) {
                    event.preventDefault();
                    context.show = true;
                    scope.$apply();
                    var ctx = µ.one("#contextMenu");
                    if (ctx.clientHeight > this.clientHeight) { context.show = false; } else {
                        context.style = {
                            "top": ((event.clientY + ctx.clientHeight > window.innerHeight) ? event.clientY - ctx.clientHeight : event.clientY) + "px",
                            "left": ((event.clientX + ctx.clientWidth > window.innerWidth) ? event.clientX - ctx.clientWidth : event.clientX) + "px"
                        };
                    }
                    scope.$apply();
                    return false;
                });

                angular.element(µ.one("#uploadHidden [type=file]")).on("change", function () {
                    var image = this.files[0];
                    if (!!image) {
                        var reader = new FileReader();
                        reader.onload = function(e) {
                            if (!image.type.match(/image.*/) || image.size > 100000) {
                                µ.one("#uploadHidden [type=hidden]").click();
                                return false;
                            } else {
                                detail.book.alternative = e.target.result;
                                scope.$apply();
                            }
                        };
                        reader.readAsDataURL(image);
                        µ.one("#uploadHidden").reset();
                    }
                });
                angular.element(µ.one("#detailCover")).on("load", detail.setBack);
                angular.element(µ.alls(".link")).on("click", detail.searchBy);
                angular.element(µ.alls(".note"))
                    .on("click", function (event) {
                        if (detail.book.userNote === "1" && event.target.getAttribute("note") === "1") { detail.book.userNote = "0"; } else {
                            detail.book.userNote = event.target.getAttribute("note");
                        }
                        scope.$apply();
                    })
                    .on("mousehover, mouseenter", function (event) {
                        var hover = event.target.getAttribute("note"),
                            allNotes = µ.alls(".note");

                        for (var jta = Math.min(detail.book.userNote, hover); jta < Math.max(detail.book.userNote, hover); jta++) {
                            if (allNotes[jta].hasClass("select")) {
                                allNotes[jta].toggleClass("minus", true);
                            } else {
                                allNotes[jta].toggleClass("plus", true);
                            }
                        }
                    })
                    .on("mouseleave", function () {
                        µ.alls(".note").toggleClass("plus", false).toggleClass("minus", false);
                    });
                angular.element(µ.alls("#contextMenu [nav]")).on("click", function () {
                    var cells = _.filter(scope.bookcells.cells, function (cell) { return !cell.toHide && !cell.toFilter; }),
                        index = _.findIndex(cells, detail.book),
                        next = index,
                        cellByRow = ~~(µ.one("[bookcells]").clientWidth / 256),
                        bookcells = µ.alls(".bookcell:not(.ng-hide)");

                    switch (this.getAttribute("nav")) {
                        case "top":
                            if (index > cellByRow) { next -= cellByRow; }
                            break;
                        case "bottom":
                            if (index + cellByRow < cells.length) { next += cellByRow; }
                            break;
                        case "left":
                            if (!!index) { next--; }
                            break;
                        case "right":
                            if (index < cells.length-1) { next++; }
                            break;
                        default:
                            return;
                    }
                    if (next !== index) {
                        if (bookcells[index].offsetTop !== bookcells[next].offsetTop) { window.scroll(0, bookcells[next].offsetTop); }
                        if (cells[next].inCollection) { detail.show(cells[next]); } else { detail.prepare(next); }
                    }
                });
            }]
        };
    });
})();
