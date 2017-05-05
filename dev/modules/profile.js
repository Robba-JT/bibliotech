"use strict";

define("profile", ["Window", "hdb", "text!../templates/profile"], function (Window, hdb, template) {
    var render = hdb.compile(template),
        Profile = function Profile() {
        var _this = this;

        em.on("openProfile", function () {
            _this.window.open();
        });

        em.once("initProfile", this, function () {
            var _this2 = this;

            req("/profile").send().then(function (user) {
                _this2.user = user;
                _this2.window = new Window("profile", render(user));
                µ.one("#recommand4u").toggleClass("notdisplayed", !user.googleSignIn);
                _this2.window.many(".googleSignIn").toggleClass("notdisplayed", !user.googleSignIn);
                _this2.window.one("#googleSignIn").set("checked", user.googleSignIn || false);
                _this2.window.one("input[name=googleSync]").set("checked", user.googleSync, false);
                _this2.window.one("form").observe("submit", function (event) {
                    event.preventDefault();
                    var parsed = event.element.parser();
                    _.forIn(parsed, function (value, key) {
                        if (_.get(user, key) === value) {
                            parsed = _.omit(parsed, key);
                        }
                    });
                    if (!_.isEmpty(parsed)) {
                        req("/profile", "PUT").send(parsed).then(function () {
                            _.assign(user, parsed);
                        }).catch(function (error) {
                            return err.add(error);
                        });
                    }
                });
                _this2.window.one("#delete").observe("click", function (event) {
                    var parsed = _this2.window.one("form").parser();
                    if (!_.get(parsed, "pwd")) {
                        _this2.window.one("input[name=pwd]").set("required", true);
                    } else {
                        req("/profile", "DELETE").send(parsed).then(function (result) {
                            console.log("result", result);
                        }).catch(function (error) {
                            return err.add(error);
                        });
                    }
                });
            });
        });

        em.on("updateOrder", this, this.updateOrder);
        em.on("orderByTag", this, this.orderByTag);
    };

    Profile.prototype.updateOrder = function (order) {
        var _this3 = this;

        var old = _.find(this.user.orders, ["tag", order.tag]);
        req("/order", old ? "PUT" : "POST").send(order).then(function () {
            if (old) {
                _.assign(old, order);
            } else {
                _this3.user.orders.push(order);
            }
        }).catch(function (error) {
            return err.add(error);
        });
    };

    Profile.prototype.orderByTag = function (tag, cells) {
        var order = _.find(this.user.orders, ["tag", tag]),
            bookcells = µ.one("bookcells");

        if (order) {
            _.forEachRight(order.list, function (one) {
                var cell = _.find(cells, ["id", one]);
                if (_.has(cell, "cell")) {
                    bookcells.insertFirst(cell.cell);
                }
            });
        }
    };

    return new Profile();
});
