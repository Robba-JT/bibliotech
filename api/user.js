const console = require("../tools/console"),
    _ = require("lodash"),
    usersDB = require("../db/users"),
    UserAPI = function () {
        this.connect = (req) => {
            usersDB.update({
                "_id": _.get(req, "user._id")
            }, {
                "$set": {
                    "last_connect": new Date(),
                    "active": _.get(req, "user.active")
                },
                "$inc": {
                    "connect_number": 1
                }
            });
        };

        this.delete = (req) => {
            const pwd = _.get(req, "body.pwd");
            console.log("pwds", pwd, req.user, usersDB.compareSync(pwd, req.user.pwd));
            if (pwd && usersDB.compareSync(pwd, req.user.password)) {
                //usersDB.delete(req.user._id);
                req.response();
            } else {
                req.error(409);
            }
        };

        this.get = (req) => req.response(_.pick(req.user, ["_id", "name", "googleSignIn", "googleSync", "orders", "userbooks"]));

        this.orderAdd = (req) => {
            const tag = _.get(req, "body.tag"),
                list = _.get(req, "body.list");

            if (tag && list) {
                usersDB.update({
                    "_id": req.user._id
                }, {
                    "$addToSet": {
                        "orders": {
                            tag,
                            list
                        }
                    }
                }).then(() => req.response()).catch(req.error);
            } else {
                req.error(409);
            }
        };

        this.orderUpdate = (req) => {
            const tag = _.get(req, "body.tag"),
                list = _.get(req, "body.list");

            if (tag && list) {
                usersDB.update({
                    "_id": req.user._id,
                    "orders.tag": tag
                }, {
                    "$set": {
                        "orders.$.list": list
                    }
                }).then(() => req.response()).catch(req.error);
            } else {
                req.error(409);
            }
        };

        this.update = (req) => {
            usersDB.update({
                "_id": req.user._id
            }, {
                "$set": req.body
            }).then(() => req.response()).catch(req.error);
        };

        return this;
    };

exports = module.exports = new UserAPI();
