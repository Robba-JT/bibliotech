define("cloud", ["text!../templates/cloud"], function (template) {
    const cloud = µ.one("cloud").set("innerHTML", template),
        Cloud = function () {
            this.list = [];

            em.on("generateTags", this, function (tags) {
                this.list = tags;
                console.log("this.list", this.list);
                //this.generate();
            });
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

    Cloud.prototype.generate = function () {
        const height = ~~(cloud.clientHeight / 2),
            width = ~~(cloud.clientWidth / 2),
            lgTags = this.tags.length,
            ratio = width / height,
            step = 3.0,
            documenttags = [],
            isOver = function (elem, others) {
                const lg = others.length,
                    overlap = function (a, b) {
                        return (Math.abs(2.0 * a.offsetLeft + a.offsetWidth - 2.0 * b.offsetLeft - b.offsetWidth) < a.offsetWidth + b.offsetWidth) && (Math.abs(2.0 * a.offsetTop + a.offsetHeight - 2.0 * b.offsetTop - b.offsetHeight) < a.offsetHeight + b.offsetHeight);
                    };
                for (let i = 0; i < lg; i += 1) {
                    if (overlap(elem, others[i])) {
                        return true;
                    }
                }
                return false;
            };

        for (let i = 0; i < lgTags; i += 1) {
            const tag = this.tags[i],
                documenttag = new Tag(tag.title, tag.weight),
                top = height - (documenttag.clientHeight / 2),
                left = width - (documenttag.clientWidth / 2),
                radius = 0,
                angle = 6.28 * Math.random();

            documenttag.css({
                "top": top,
                "left": left
            });
            while (isOver(documenttag, documenttags)) {
                radius += step;
                angle += (i % 2 === 0 ? 1 : -1) * step;
                top = height + radius * Math.sin(angle) - (documenttag.clientHeight / 2.0);
                left = width - (documenttag.clientWidth / 2.0) + (radius * Math.cos(angle)) * ratio;
                documenttag.css({
                    "top": top,
                    "left": left
                });
            }
            documenttags.push(documenttag);
        }
    };

    Cloud.prototype.add = function (title) {
        _.noop();
    };

    Cloud.prototype.remove = function (title) {
        _.noop();
    };

    Cloud.prototype.reset = function () {
        cloud.set("innerHTML", template);
    };

    return new Cloud();
});
