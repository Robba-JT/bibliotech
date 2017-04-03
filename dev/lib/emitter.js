const em = (function () {
    const Emitter = function () {
            this.onEvents = [];
            this.onceEvents = [];
        },
        Event = function (event, context, callback) {
            if (_.isFunction(context)) {
                callback = context;
                context = null;
            }
            if (!_.isString(event) || !_.isFunction(callback)) {
                throw new Error("Invalid event");
            }
            this.event = event;
            this.context = context;
            this.callback = callback;
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

    Emitter.prototype.removeOn = function (event) {
        _.remove(this.onEvents, ["event", event]);
        return this;
    };

    Emitter.prototype.removeOnce = function (event) {
        _.remove(this.onceEvents, ["event", event]);
        return this;
    };

    Emitter.prototype.remove = function (event) {
        return this.removeOn(event).removeOnce(event);
    };

    Emitter.prototype.emit = function (event, data) {
        const events = _.concat(_.filter(this.onEvents, ["event", event]),
            _.remove(this.onceEvents, ["event", event]));

        _.forEach(events, (evt) => {
            evt.execute(data);
        });
        return this;
    };

    Event.prototype.execute = function (data) {
        return Reflect.apply(this.callback, this.context, [data]);
    };

    return new Emitter();
})();
