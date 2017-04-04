define("profile", ["Window", "hdb", "text!../templates/profile"], function (Window, hdb, template) {
    const render = hdb.compile(template),
        Profile = function () {
            em.on("openProfile", () => {
                this.window.open();
            });

            em.once("initProfile", this, function () {
                req("/profile").send().then((user) => {
                    this.user = user;
                    this.window = new Window("profile", render(user));
                    µ.one("#recommand4u").toggleClass("notdisplayed", !user.googleSignIn);
                    this.window.many(".googleSignIn").toggleClass("notdisplayed", !user.googleSignIn);
                    this.window.one("#googleSignIn").set("checked", user.googleSignIn || false);
                    this.window.one("input[name=googleSync]").set("checked", user.googleSync, false);
                    this.window.one("form").observe("submit", (event) => {
                        event.preventDefault();
                        let parsed = event.element.parser();
                        _.forIn(parsed, (value, key) => {
                            if (_.get(user, key) === value) {
                                parsed = _.omit(parsed, key);
                            }
                        });
                        if (!_.isEmpty(parsed)) {
                            req("/profile", "PUT").send(parsed).then(() => {
                                _.assign(user, parsed);
                            }).catch((error) => {
        err.add(error);
    });
                        }
                    });
                });
            });
        };

    return new Profile();
});
