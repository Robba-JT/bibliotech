define("cloud", ["text!../templates/cloud"], function (template) {
    const cloud = µ.one("cloud").set("innerHTML", template),
        Cloud = function () {
            em.on("generateTags", this, function (tags) {
                this.list = tags;
                this.reset().generate();
            });

            em.on("openCloud", this, this.open);
            em.on("closeCloud", this, this.close);
            em.on("resize", this, () => {
                this.close().reset().generate(this.list);
            });
            em.on("updateTag", this, this.update);

            cloud.one("div").observe("click", this.close);
        },
        Tag = function (title, weight) {
            this.title = title;
            this.weight = weight;
            this.span = µ.new("span", {
                "innerHTML": title,
                "title": weight
            }).toggleClass(`tag tag${Math.min(~~(weight / 5) + 1, 10)}`);
        };

    Tag.prototype.appendTo = function (parent) {
        if (this.span) {
            this.span.appendTo(parent);
        }
        return this;
    };

    Cloud.prototype.close = function () {
        cloud.toggleClass("invisible", true);
        µ.one("html").toggleClass("overflown", false);
        return this;
    };

    Cloud.prototype.generate = function () {
        _.reduce(this.list, (list, one) => {
            _.forEach(one.tags, (tag) => {
                if (!_.has(list, tag)) {
                    list[tag] = 0;
                }
                list[tag] += 1;
            });
            return list;
        }, this.computedList = {});
        if (_.isEmpty(this.computedList)) {
            µ.one("#tags").toggleClass("notdisplayed", true);
        } else {
            const height = ~~(cloud.get("clientHeight") / 2),
                width = ~~(cloud.get("clientWidth") / 2),
                ratio = width / height,
                step = 3.0,
                isOver = function (elem, others) {
                    const lg = others.length,
                        overlap = function (a, b) {
                            return (Math.abs(2.0 * a.offsetLeft + a.offsetWidth - 2.0 * b.offsetLeft - b.offsetWidth) < a.offsetWidth + b.offsetWidth) && (Math.abs(2.0 * a.offsetTop + a.offsetHeight - 2.0 * b.offsetTop - b.offsetHeight) < a.offsetHeight + b.offsetHeight);
                        };
                    for (let i = 0; i < lg; i += 1) {
                        if (overlap(elem.element, others[i].element)) {
                            return true;
                        }
                    }
                    return false;
                };
            _.forIn(this.computedList, (weight, title) => {
                const tag = new Tag(title, weight).appendTo(cloud),
                    span = tag.span;

                let top = height - (span.get("clientHeight") / 2),
                    left = width - (span.get("clientWidth") / 2),
                    radius = 0,
                    angle = 6.28 * Math.random();

                span.css({
                    top,
                    left
                });
                while (isOver(span, this.tags)) {
                    radius += step;
                    angle += (this.tags.length % 2 === 0 ? 1 : -1) * step;
                    top = height + radius * Math.sin(angle) - (span.get("clientHeight") / 2.0);
                    left = width - (span.get("clientWidth") / 2.0) + (radius * Math.cos(angle)) * ratio;
                    span.css({
                        top,
                        left
                    });
                }
                span.observe("click", () => {
                    this.close();
                    em.emit("filtreTag", title);
                });
                this.tags.push(span);
                this.options.push(`<option value="${title}">${title}</option>`);
            });
            this.options.sort();
            if (µ.one("#collection").hasClass("active")) {
                µ.one("#tags").toggleClass("notdisplayed", false);
            }
        }
        return this;
    };

    Cloud.prototype.open = function () {
        µ.one("html").toggleClass("overflown", true);
        cloud.toggleClass("invisible", false);
        µ.one("#saveorder").toggleClass("notdisplayed", true);
        return this;
    };

    Cloud.prototype.reset = function () {
        this.tags = [];
        this.options = [];
        cloud.set("innerHTML", template).one("div").observe("click", this.close);
        return this;
    };

    Cloud.prototype.update = function (param) {
        const list = _.find(this.list, ["id", param.id]);
        if (list) {
            list.tags = param.tags;
        } else {
            this.list.push(param);
        }
        this.reset().generate();
        if (µ.one("#selectedTag").visible && µ.one("#selectedTag span").text) {
            em.emit("filtreTag", µ.one("#selectedTag span").text);
        }
        return this;
    };

    return new Cloud();
});
