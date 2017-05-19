define("profile", ["Window", "hdb", "text!../templates/profile"], function (Window, hdb, template) {
    const render = hdb.compile(template),
        Profile = function () {
            em.on("openProfile", () => {
                this.window.open();
            });

            em.on("getUser", () => this.user._id);

            em.once("init", this, function () {
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
                            }).catch((error) => err.add(error));
                        }
                    });
                    this.window.one("#delete").observe("click", (event) => {
                        const parsed = this.window.one("form").parser();
                        if (!_.get(parsed, "pwd")) {
                            this.window.one("input[name=pwd]").set("required", true);
                        } else {
                            req("/profile", "DELETE").send(parsed).then(() => window.location.reload(true)).catch((error) => err.add(error));
                        }
                    });
                });
            });

            em.on("updateOrder", this, this.updateOrder);
            em.on("orderByTag", this, this.orderByTag);
        };

    Profile.prototype.orderByTag = function (tag, cells) {
        const order = _.find(this.user.orders, ["tag", tag]),
            bookcells = µ.one("bookcells");

        if (order) {
            _.forEachRight(order.list, (one) => {
                const cell = _.find(cells, ["id", one]);
                if (_.has(cell, "cell")) {
                    bookcells.insertFirst(cell.cell);
                }
            });
        }
    };

    Profile.prototype.updateOrder = function (order) {
        const old = _.find(this.user.orders, ["tag", order.tag]);
        req("/order", old ? "PUT" : "POST").send(order).then(() => {
            if (old) {
                _.assign(old, order);
            } else {
                this.user.orders.push(order);
            }
        }).catch((error) => err.add(error));
    };

    return new Profile();
});
