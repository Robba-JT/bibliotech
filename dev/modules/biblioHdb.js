define("biblioHdb", ["hdb"], function (hdb) {
    hdb.registerHelper("ifPreview", function (access, options) {
        if (access !== "NONE") {
            return options.fn(this);
        }
    });

    hdb.registerHelper("ifPers", function (id, options) {
        try {
            const test = JSON.parse(id);
            return options.fn(this);
        } catch (error) {
            return options.inverse(this);
        }
    });

    hdb.registerHelper("ifRec", function (id, options) {
        try {
            const test = JSON.parse(id);
            if (test.user) {
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
        return _.split(_.trim(authors), ",");
    });

    hdb.registerHelper("ifISBN", function (isbn10, isbn13, options) {
        if (isbn10 || isbn13) {
            return options.fn(this);
        }
    });
});
