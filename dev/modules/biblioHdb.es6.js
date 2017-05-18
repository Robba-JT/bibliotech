define("biblioHdb", ["hdb"], function (hdb) {

    hdb.registerHelper("eachAuthors", function (authors) {
        var result = "";
        _.forEach(_.split(_.trim(authors), ","), (author) => {
            result += `<span searchby="inauthor:">${author}</span>`;
        });
        return result;
    });

    hdb.registerHelper("formatDate", function (date, lang) {
        const options = {
            "year": "numeric",
            "month": "long",
            "day": "numeric"
        };
        if (date) {
            return new Date(date).toLocaleDateString(lang || "fr", options);
        }
    });

    hdb.registerHelper("formatInputDate", function (date) {
        if (date) {
            return new Date(date).toISOString().slice(0, 10);
        }
    });

    hdb.registerHelper("ifCover", function (cover, alt, options) {
        return cover || alt ? options.fn(this) : options.inverse(this);
    });

    hdb.registerHelper("ifISBN", function (isbn10, isbn13, options) {
        if (isbn10 || isbn13) {
            return options.fn(this);
        }
    });

    hdb.registerHelper("ifPers", function (id, options) {
        return _.isPlainObject(id) && id.user === em.emit("getUser") ? options.fn(this) : options.inverse(this);
    });

    hdb.registerHelper("ifRec", function (id, options) {
        return _.isPlainObject(id) && id.user !== em.emit("getUser") ? options.fn(this) : options.inverse(this);
    });
});
