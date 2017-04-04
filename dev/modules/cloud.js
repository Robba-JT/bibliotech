define("cloud", ["text!../templates/cloud"], function (template) {
    const cloud = µ.one("cloud").set("innerHTML", template),
        Cloud = function () {
            em.on("generateTags", this, function (tags) {
                this.list = tags;
                this.reset().generate();
            });

            em.on("openCloud", this, this.open);
            em.on("closeCloud", this, this.close);

            cloud.one("div").observe("click", this.close);
        },
        Tag = function (title, books) {
            this.title = title;
            this.books = books;
            this.span = µ.new("span", {
                "innerHTML": title
            }).toggleClass(`tag tag${Math.min(~~(books.length / 5) + 1, 10)}`);
        };

    Reflect.defineProperty(Tag.prototype, "weight", {
        get() {
            return this.books.length;
        }
    });

    Tag.prototype.appendTo = function (parent) {
        if (this.span) {
            this.span.appendTo(parent);
        }
        return this;
    };

    Cloud.prototype.generate = function () {
        const height = ~~(cloud.clientHeight / 2),
            width = ~~(cloud.clientWidth / 2),
            lgTags = this.list.length,
            ratio = width / height,
            step = 3.0,
            isOver = function (elem, others) {
                const lg = others.length,
                    overlap = function (a, b) {
                        return (Math.abs(2.0 * a.offsetLeft + a.offsetWidth - 2.0 * b.offsetLeft - b.offsetWidth) < a.offsetWidth + b.offsetWidth) && (Math.abs(2.0 * a.offsetTop + a.offsetHeight - 2.0 * b.offsetTop - b.offsetHeight) < a.offsetHeight + b.offsetHeight);
                    };
                for (let i = 0; i < lg; i += 1) {
                    if (overlap(elem, others[i].span)) {
                        return true;
                    }
                }
                return false;
            };

        for (let i = 0; i < lgTags; i += 1) {
            const tag = new Tag(this.list[i].title, this.list[i].weight).appendTo(cloud),
                span = tag.span;

            let top = height - (span.clientHeight / 2),
                left = width - (span.clientWidth / 2),
                radius = 0,
                angle = 6.28 * Math.random();

            span.css({
                top,
                left
            });
            while (isOver(tag, this.tags)) {
                radius += step;
                angle += (i % 2 === 0 ? 1 : -1) * step;
                top = height + radius * Math.sin(angle) - (span.clientHeight / 2.0);
                left = width - (span.clientWidth / 2.0) + (radius * Math.cos(angle)) * ratio;
                span.css({
                    top,
                    left
                });
            }
            this.tags.push(span);
        }
        return this;
    };

    Cloud.prototype.add = function (title, book) {
        _.noop();
    };

    Cloud.prototype.remove = function (title, book) {
        _.noop();
    };

    Cloud.prototype.reset = function () {
        this.list = this.tags = [];
        cloud.set("innerHTML", template).one("div").observe("click", this.close);
        return this;
    };

    Cloud.prototype.open = function () {
        µ.one("html").toggleClass("overflown", true);
        cloud.toggleClass("notdisplayed", false);
        return this;
    };

    Cloud.prototype.close = function () {
        cloud.toggleClass("notdisplayed", true);
        µ.one("html").toggleClass("overflown", false);
        return this;
    };

    return new Cloud();
});
