const fs = require("fs-extra"),
    booksAPI = require("../api/books"),
    loginAPI = require("../api/login"),
    userAPI = require("../api/user"),
    router = require("../tools/express").router;

// A modifier
const _ = require("lodash"),
    google = require("../api/google")();

module.exports = exports = (() => {
    //Passport init
    router
        .use(loginAPI.initialize())
        .use(loginAPI.session());

    //Maintenance url
    //.get("*", function (req, res) { req.render("maintenance", 503); })

    //Display pages
    router.get("/", [(req, res, next) => {
        if (req.isAuthenticated()) {
            next();
        } else {
            res.clearCookie();
            req.render("login");
        }
    }, (req) => {
        if (req.user.admin) {
            const today = new Date();
            req.session.expires = req.session.cookie.expires = new Date(today.getTime() + 600000);
        }
        req.render(req.user.admin ? "admin" : "bibliotech");
    }]);

    //Google OAuth
    router.get("/gAuth", loginAPI.gAuth)
        .get("/googleAuth", [loginAPI.googleAuth, userAPI.connect]);

    //Login
    router.post("/login", [loginAPI.auth, userAPI.connect]);

    //Nouvel utilisateur
    router.post("/new", [loginAPI.new, userAPI.connect]);

    //Mot de passe oublié
    router.post("/mail", loginAPI.forgotten);

    //Logout
    router.get("/logout", loginAPI.out);

    //Validate
    router.all("*", loginAPI.validate);

    //templates
    router.get("/templates/*", booksAPI.template);

    //Profile
    router.route("/profile")
        .get(userAPI.get)
        .put(userAPI.update)
        .delete(userAPI.delete);

    //Collection
    router.get("/collection", booksAPI.collection);

    //Covers
    router.get("/cover/*", booksAPI.cover);

    router.param("book", booksAPI.validate);
    router.route("/book/:book")
        .get(booksAPI.book)
        .post(booksAPI.add)
        .delete(booksAPI.delete);

    //Detail
    router.route("/detail/*")
        .get(booksAPI.detail)
        .put(booksAPI.update);

    //Search
    router.post("/search", google.search);

    //Preview
    router.get("/preview/*", booksAPI.preview);

    //Erreur url
    router.all("*", (req) => {
        req.render("error", {
            "error": "Error 404"
        }, 404);
    });
})();
