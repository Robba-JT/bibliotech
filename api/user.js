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

        this.delete = (req) => req.response();

        this.get = (req) => req.response(_.pick(req.user, ["_id", "name", "googleSignIn"]));

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
