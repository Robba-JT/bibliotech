const _ = require("lodash"),
    Event = function (title, user, callback) {
        this.title = title;
        this.user = user;
        this.callback = callback;
    },
    Emitter = function () {
        this.onEvents = [];
        this.onceEvents = [];
    };

Event.prototype.execute = function (...data) {
    return this.callback.call(null, data);
};

Emitter.prototype.emit = function (event, user, ...data) {
    const events = _.concat(_.filter(this.onEvents, {
                "title": event,
                "user": user
            }),
            _.remove(this.onceEvents, {
                "title": event,
                "user": user
            })),
        result = [];

    _.forEach(events, (evt) => {
        result.push(evt.execute(...data));
    });
    return result.length === 1 ? result[0] : result;
};

Emitter.prototype.on = function (...args) {
    const new_event = new Event(...args);
    this.onEvents.push(new_event);
    return this;
};

Emitter.prototype.once = function (...args) {
    const new_event = new Event(...args);
    this.onceEvents.push(new_event);
    return this;
};

Emitter.prototype.remove = function (event, user) {
    return this.removeOn(event, user).removeOnce(event, user);
};

Emitter.prototype.removeOn = function (event, user) {
    _.remove(this.onEvents, ["event", event, "user", user]);
    return this;
};

Emitter.prototype.removeOnce = function (event, user) {
    _.remove(this.onceEvents, ["event", event, "user", user]);
    return this;
};

Emitter.prototype.removeByUser = function (user) {
    return this.removeOnByUser(user).removeOnceByUser(user);
};

Emitter.prototype.removeOnByUser = function (user) {
    _.remove(this.onEvents, ["user", user]);
    return this;
};

Emitter.prototype.removeOnceByUser = function (user) {
    _.remove(this.onceEvents, ["user", user]);
    return this;
};

exports = module.exports = new Emitter();
