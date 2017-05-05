"use strict";

var em = function () {
    var Emitter = function Emitter() {
        this.onEvents = [];
        this.onceEvents = [];
    },
        Event = function Event(event, context, callback) {
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

    Emitter.prototype.on = function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        var new_event = new (Function.prototype.bind.apply(Event, [null].concat(args)))();
        this.onEvents.push(new_event);
        return this;
    };

    Emitter.prototype.once = function () {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        var new_event = new (Function.prototype.bind.apply(Event, [null].concat(args)))();
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

    Emitter.prototype.emit = function (event) {
        for (var _len3 = arguments.length, data = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
            data[_key3 - 1] = arguments[_key3];
        }

        var events = _.concat(_.filter(this.onEvents, ["event", event]), _.remove(this.onceEvents, ["event", event]));

        _.forEach(events, function (evt) {
            evt.execute.apply(evt, data);
        });
        return this;
    };

    Event.prototype.execute = function () {
        for (var _len4 = arguments.length, data = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
            data[_key4] = arguments[_key4];
        }

        return Reflect.apply(this.callback, this.context, data);
    };

    return new Emitter();
}();
