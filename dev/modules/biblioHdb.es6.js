define("biblioHdb", ["hdb"], function (hdb) {
    hdb.registerHelper("ifPers", function (id, options) {
        try {
            JSON.parse(id);
            return options.fn(this);
        } catch (error) {
            return options.inverse(this);
        }
    });

    hdb.registerHelper("ifRec", function (id, options) {
        try {
            if (JSON.parse(id).user) {
                return options.fn(this);
            }
        } catch (error) {}
    });

    hdb.registerHelper("formatDate", function (date, lang) {
        const options = {
            "year": "numeric",
            "month": "long",
            "day": "numeric"
        };
        return new Date(date || new Date()).toLocaleDateString(lang || "fr", options);
    });

    hdb.registerHelper("eachAuthors", function (authors) {
        var result = "";
        _.forEach(_.split(_.trim(authors), ","), (author) => {
            result += `<span searchby="inauthor:">${author}</span>`;
        });
        return result;
    });

    hdb.registerHelper("ifISBN", function (isbn10, isbn13, options) {
        if (isbn10 || isbn13) {
            return options.fn(this);
        }
    });

    hdb.registerHelper("ifCover", function (cover, alt, options) {
        return cover || alt ? options.fn(this) : options.inverse(this);
    });
});