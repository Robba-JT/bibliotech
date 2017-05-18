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

    Event.prototype.execute = function () {
        for (var _len = arguments.length, data = Array(_len), _key = 0; _key < _len; _key++) {
            data[_key] = arguments[_key];
        }

        return Reflect.apply(this.callback, this.context, data);
    };

    Emitter.prototype.emit = function (event) {
        for (var _len2 = arguments.length, data = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
            data[_key2 - 1] = arguments[_key2];
        }

        var events = _.concat(_.filter(this.onEvents, ["event", event]), _.remove(this.onceEvents, ["event", event])),
            result = [];

        _.forEach(events, function (evt) {
            result.push(evt.execute.apply(evt, data));
        });
        return result.length === 1 ? result[0] : result;
    };

    Emitter.prototype.on = function () {
        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            args[_key3] = arguments[_key3];
        }

        var new_event = new (Function.prototype.bind.apply(Event, [null].concat(args)))();
        this.onEvents.push(new_event);
        return this;
    };

    Emitter.prototype.once = function () {
        for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
            args[_key4] = arguments[_key4];
        }

        var new_event = new (Function.prototype.bind.apply(Event, [null].concat(args)))();
        this.onceEvents.push(new_event);
        return this;
    };

    Emitter.prototype.remove = function (event) {
        return this.removeOn(event).removeOnce(event);
    };

    Emitter.prototype.removeOn = function (event) {
        _.remove(this.onEvents, ["event", event]);
        return this;
    };

    Emitter.prototype.removeOnce = function (event) {
        _.remove(this.onceEvents, ["event", event]);
        return this;
    };

    return new Emitter();
}();
