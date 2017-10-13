"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

;
(function () {
    var _global = (typeof global === "undefined" ? "undefined" : _typeof(global)) === "object" && global && global.Object === Object && global,
        _self = (typeof self === "undefined" ? "undefined" : _typeof(self)) === "object" && self && self.Object === Object && self,
        ctx = _global || _self || Function("return this")(),
        dom = {},
        sizables = ["width", "max-width", "height", "max-height", "top", "left", "bottom", "right", "border", "border-top", "border-right", "border-bottom", "border-left", "border-radius", "padding", "padding-top", "padding-right", "padding-bottom", "padding-left", "margin", "margin-top", "margin-right", "margin-bottom", "margin-left"],

    /**
     * Element constructor
     * @param {HTMLElement} elt Element
     * @returns {Object} Element
     **/
    myElement = function myElement(elt) {
        if (elt instanceof myElement) {
            return elt;
        }
        if (elt instanceof HTMLElement || elt instanceof Document || elt instanceof Window) {
            this.element = elt;
            this.name = elt.name;
            this.tag = _.toUpper(elt.tagName);
            this.id = elt.id;
            this.classes = elt.classList;
            this.value = elt.value;
        }
        return this;
    },

    /**
     * Collection constructor
     * @param {NodeList} elts List of elements
     * @returns {Array} myElement(s)
     **/
    myCollection = function myCollection(elts) {
        var _this = this;

        if (elts instanceof myCollection) {
            return elts;
        }
        this.elements = [];
        Reflect.apply(Array.prototype.forEach, elts, [function (elt) {
            _this.elements.push(elt instanceof myElement ? elt : new myElement(elt));
        }]);
        return this;
    };

    /**
     * Test color
     * @param {Array} rgb rgb color
     * @returns {Boolean} is dark
     **/
    dom.isDark = function (rgb) {
        return 0.3 * rgb[0] + 0.59 * rgb[1] + 0.11 * rgb[2] <= 128;
    };

    /**
     * DOM Collection selector
     * @param {string} selector query selector
     * @param {HTMLElement} parent parent
     * @returns {myCollection} query result
     **/
    dom.many = function (selector) {
        var parent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;

        if (parent instanceof myElement) {
            parent = parent.element;
        }
        return new myCollection(selector instanceof HTMLCollection || selector instanceof NodeList ? selector : parent.querySelectorAll(selector));
    };

    /**
     * Create elements
     * @param {String} tag tagName
     * @param {Object} attrs attributes list
     * @returns {myElement} new element
     **/
    dom.new = function (tag, attrs) {
        var elt = new myElement(document.createElement(tag));
        if (_.isPlainObject(attrs)) {
            elt.set(attrs);
        } else if (_.isString(attrs)) {
            elt.html = attrs;
        }
        return elt;
    };

    /**
     * DOM Element selector
     * @param {string} selector query selector
     * @param {HTMLElement} parent parent
     * @returns {myElement} query result
     **/
    dom.one = function (selector) {
        var parent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;

        if (_.isString(parent)) {
            parent = document.querySelector(parent);
        } else if (parent instanceof myElement) {
            parent = parent.element;
        }
        return new myElement(selector instanceof HTMLElement || selector instanceof Document || selector instanceof Window ? selector : parent.querySelector(selector));
    };

    /**
     * Convert rgb to hex
     * @param {Array} rgb rgb color
     * @returns {String} hex color
     **/
    dom.rgbToHex = function (rgb) {
        return "#" + ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).substr(1);
    };

    /**
     * New element assigner
     * @param {String} tag tagName
     * @param {Object} attrs Attributes list
     * @returns {myElement} new element
     **/
    myElement.prototype.append = function (tag, attrs) {
        var _this2 = this;

        if (tag instanceof myCollection || _.isArray(tag)) {
            var elts = tag.elements || tag;
            _.forEach(elts, function (elt) {
                _this2.element.appendChild(elt.set(attrs).element);
            });
            return this;
        } else {
            var elt = tag instanceof HTMLElement || tag instanceof myElement ? tag.set(attrs) : dom.new(tag, attrs);
            this.element.appendChild(elt.element);
            return elt;
        }
    };

    /**
     * New element assigner
     * @param {myElement} parent parent
     * @returns {myElement} this element
     **/
    myElement.prototype.appendTo = function (parent) {
        var elt = parent instanceof myElement ? parent.element : parent;
        elt.appendChild(this.element);
        return this;
    };

    /**
     * Element stylizer
     * @param {Object} styles Styles
     * @param {String} values values
     * @returns {myElement} this element
     **/
    myElement.prototype.css = function (styles, values) {
        var _this3 = this;

        if (_.isString(styles)) {
            if (_.isUndefined(values)) {
                return _.get(this, "element.style." + styles);
            }
            var inter = {};
            inter[styles] = values;
            styles = inter;
        }
        if (_.isPlainObject(styles)) {
            for (var style in styles) {
                if (this.element) {
                    (function () {
                        var kebabStyle = _.kebabCase(style),
                            trimValue = _.split(_.toString(styles[style]), " ");

                        trimValue.forEach(function (value, index) {
                            if (!isNaN(Number(value)) && !_.has(value, "%") && !_.has(value, "px")) {
                                trimValue[index] = value + "px";
                            }
                        });
                        _this3.element.style[kebabStyle] = trimValue.join(" ");
                    })();
                }
            }
        }
        return this;
    };

    /**
     * set focus on
     * @returns {myElement} this element
     **/
    myElement.prototype.focus = function () {
        if (this.element) {
            this.element.focus();
        }
        return this;
    };

    /**
     * Get attribute value
     * @param {String} attr attribute name
     * @returns {String} attribute value
     **/
    myElement.prototype.get = function (attr) {
        var result = null;
        if (this.element) {
            result = this.element[attr] || Reflect.apply(this.element.getAttribute, this.element, [attr]);
        }
        return result;
    };

    /**
     * Test class prototype
     * @param {String} cl Class
     * @returns {Boolean} Test
     **/
    myElement.prototype.hasClass = function (cl) {
        return this.classes.contains(cl);
    };

    /**
     * New element assigner
     * @param {String} tag tagName
     * @param {Object} attrs Attributes list
     * @returns {myElement} new element
     **/
    myElement.prototype.insertFirst = function (tag, attrs) {
        var _this4 = this;

        if (tag instanceof myCollection || _.isArray(tag)) {
            var elts = tag.elements || tag;
            _.forEach(elts, function (elt) {
                _this4.element.insertAdjacentElement("afterbegin", elt.set(attrs).element);
            });
            return this;
        } else {
            var elt = tag instanceof HTMLElement || tag instanceof myElement ? tag.set(attrs) : dom.new(tag, attrs);
            this.element.insertAdjacentElement("afterbegin", elt.element);
            return elt;
        }
    };

    /**
     * multiple selector in myElement
     * @param {Object} selector selector
     * @returns {myCollection} selected elements
     **/
    myElement.prototype.many = function (selector) {
        return dom.many(selector, this);
    };

    /**
     * Element listener prototype
     * @param {String} eventsName Events name
     * @param {Object} data data to attach
     * @param {Function} callback Callback function
     * @param {Boolean} capture capture
     * @returns {myElement} this element
     **/
    myElement.prototype.observe = function (eventsName) {
        var _this5 = this;

        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
        }

        var data = args[0],
            callback = args[1],
            _args$ = args[2],
            capture = _args$ === undefined ? false : _args$;

        if (_.isFunction(data)) {
            capture = callback || false;
            callback = data;
            data = null;
        }
        if (_.has(this, "element")) {
            if (!this.element.listeners) {
                this.element.listeners = [];
            }
            eventsName.split(",").forEach(function (eventName) {
                var newEvent = {
                    "event": eventName.trim(),
                    callback: callback,
                    "fn": function fn(event) {
                        event.data = data;
                        event.element = _this5;
                        return Reflect.apply(callback, _this5, [event]);
                    },
                    capture: capture
                };
                _this5.element.addEventListener(newEvent.event, newEvent.fn, newEvent.capture);
                _this5.element.listeners.push(newEvent);
            });
        }
        return this;
    };

    /**
     * Unique selector in myElement
     * @param {Object} selector selector
     * @returns {myElement} selected element
     **/
    myElement.prototype.one = function (selector) {
        return dom.one(selector, this);
    };

    /**
     * FORM Element parser prototype
     * @param {Object} obj Object values
     * @returns {myElement} this element
     **/
    myElement.prototype.parser = function () {
        var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        if (this.tag === "FORM") {
            try {
                this.many("input").each(function (input) {
                    if (_.has(input, "name") && input.name && input.value) {
                        if (input.get("type") === "checkbox") {
                            obj[input.name] = input.checked;
                        } else if (input.get("type") !== "radio" || input.checked === true) {
                            obj[input.name] = input.value;
                        }
                    }
                });
            } catch (e) {
                throw new Error("Invalid FORM Element");
            }
        }
        return obj;
    };

    /**
     * Element prepend
     * @param {String} tag tagName
     * @param {Object} attrs Attributes list
     * @returns {myElement} new element
     **/
    myElement.prototype.prepend = function (tag, attrs) {
        var elt = tag instanceof HTMLElement || tag instanceof myElement ? tag.set(attrs) : dom.new(tag, attrs),
            parent = this.parent;
        parent.element.insertBefore(elt.element, this.element);
        return elt;
    };

    /**
     * Location reload
     * @param {Boolean} forceGet force GET request
     * @returns {myElement} element
     **/
    myElement.prototype.reload = function () {
        var forceGet = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        forceGet = Boolean(forceGet);
        if (this.element instanceof Document) {
            this.element.location.reload(forceGet);
        } else if (this.element instanceof HTMLIFrameElement) {
            this.element.contentWindow.location.reload(forceGet);
        }
        return this;
    };

    /**
     * Remove HTMLElement
     * @returns {myElement} this element
     **/
    myElement.prototype.remove = function () {
        if (this.element) {
            this.element.parentNode.removeChild(this.element);
        }
        return this;
    };

    /**
     * FORM element reset
     * @params {Object} defaults default value
     * @returns {myElement} this element
     **/
    myElement.prototype.reset = function () {
        var defaults = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        if (this.tag === "FORM") {
            this.element.reset();
            for (var input in defaults) {
                if (_.has(defaults, input)) {
                    this.one("[name=" + input + "]").set("value", defaults[input]);
                }
            }
        }
        return this;
    };

    /**
     * Multiple attributes setter
     * @param {Object} attrs list of attributes
     * @param {String} value value
     * @returns {myElement} this element
     **/
    myElement.prototype.set = function (attrs, value) {
        if (_.isString(attrs) && !_.isUndefined(value)) {
            var alt = {};
            alt[attrs] = value;
            attrs = alt;
        }
        if (_.isPlainObject(attrs)) {
            for (var attr in attrs) {
                if (attr in this.element) {
                    this.element[attr] = attrs[attr];
                } else {
                    this.element.setAttribute(attr, attrs[attr]);
                }
            }
        }
        return this;
    };

    /**
     * Get element style
     * @param {String} style style
     * @returns {myElement} this element style
     **/
    myElement.prototype.style = function (style) {
        return _.get(this.element, style ? "style." + style : "style");
    };

    /**
     * Submit FORM
     * @param {FormData} data FormData
     * @returns {myElement} this element
     **/
    myElement.prototype.submit = function () {
        if (!_.has(this, "element") || this.tag !== "FORM") {
            throw new Error("Invalid FORM!");
        } else {
            this.element.submit();
        }
        return this;
    };

    /**
     * New textNode assigner
     * @param {String} text textNode
     * @returns {myElement} new element
     **/
    myElement.prototype.textNode = function (text) {
        var node = document.createTextNode(text);
        this.element.appendChild(node);
        return node;
    };

    /**
     * Element toggle classes prototype
     * @param {ArrayString} classes Class names
     * @param {Boolean} toAdd Action
     * @returns {myElement} this element
     **/
    myElement.prototype.toggleClass = function (classes, toAdd) {
        var _this6 = this;

        if (_.has(this, "element")) {
            var action = _.isUndefined(toAdd) ? "toggle" : toAdd && "add" || "remove";
            if (!Array.isArray(classes)) {
                classes = classes.split(" ");
            }
            classes.forEach(function (cl) {
                if (_this6.element) {
                    _this6.element.classList[action](cl);
                }
            });
        }
        return this;
    };

    /**
     * Event trigger
     * @param {String} eventName Event name
     * @returns {myElement} this element;
     **/
    myElement.prototype.trigger = function (eventName) {
        if (this.element) {
            if (this.element[eventName] && _.isFunction(this.element[eventName])) {
                Reflect.apply(this.element[eventName], this.element, []);
            } else {
                var isMouse = _.has(["click", "mouseenter", "mouseleave", "mouseup", "mousedown"], eventName);
                var thisEvent = null;
                try {
                    thisEvent = isMouse ? new MouseEvent(eventName) : new Event(eventName);
                } catch (error) {
                    thisEvent = document.createEvent(isMouse ? "MouseEvents" : "HTMLEvents");
                    thisEvent.initEvent(eventName, true, true);
                }
                this.element.dispatchEvent(thisEvent);
            }
        }
        return this;
    };

    /**
     * Element remove listener prototype
     * @param {String} eventName Event name
     * @param {Function} fn Callback function
     * @param {Boolean} capture capture
     * @returns {myElement} this element
     **/
    myElement.prototype.unobserve = function (eventName, fn, capture) {
        if (_.has(this, "element")) {
            //this.element.removeEventListener(eventName, fn, capture);
            var listener = _.remove(this.element.listeners, ["event", eventName, "callback", fn, "capture", capture]);
            if (event) {
                this.element.removeEventListener(listener.event, listener.fn, listener.capture);
            }
        }
        return this;
    };

    /**
     * Element remove all listener prototype
     * @param {String} eventName Event name
     * @returns {myElement} this element
     **/
    myElement.prototype.unobserveAll = function (eventName) {
        var _this7 = this;

        if (_.has(this, "element")) {
            _.forEach(_.remove(this.element.listeners, ["event", eventName]) || [], function (listener) {
                return _this7.element.removeEventListener(listener.event, listener.fn, listener.capture);
            });
        }
        return this;
    };

    /**
     * Unset attributes
     * @param {Array} attrs attributes
     * @returns {myElement} this element
     **/
    myElement.prototype.unset = function (attrs) {
        var _this8 = this;

        if (_.isString(attrs)) {
            attrs = [attrs];
        }
        attrs.forEach(function (attr) {
            _this8.element.removeAttribute(attr);
        });
        return this;
    };

    Reflect.defineProperty(myElement.prototype, "checked", {
        get: function get() {
            return this.element.checked;
        },
        set: function set(checked) {
            this.element.checked = Boolean(checked);
        }
    });

    Reflect.defineProperty(myElement.prototype, "exists", {
        get: function get() {
            return Boolean(this.element);
        }
    });

    Reflect.defineProperty(myElement.prototype, "files", {
        get: function get() {
            return this.element && this.element.files || [];
        }
    });

    Reflect.defineProperty(myElement.prototype, "html", {
        get: function get() {
            return this.element && this.element.innerHTML || "";
        },
        set: function set(code) {
            if (this.element) {
                this.element.innerHTML = code;
            }
        }
    });

    Reflect.defineProperty(myElement.prototype, "listeners", {
        get: function get() {
            return this.element.listeners;
        }
    });

    Reflect.defineProperty(myElement.prototype, "loaded", {
        get: function get() {
            return this.element.onload;
        },
        set: function set(cb) {
            var _this9 = this;

            if (this.tag === "IMG" && _.isFunction(cb)) {
                this.element.onload = function () {
                    Reflect.apply(cb, _this9, []);
                };
            }
        }
    });

    Reflect.defineProperty(myElement.prototype, "parent", {
        get: function get() {
            return dom.one(this.element.parentNode);
        }
    });

    Reflect.defineProperty(myElement.prototype, "siblings", {
        get: function get() {
            var children = dom.many(this.element.parentNode.children);
            _.remove(children.elements, this);
            return children;
        }
    });

    Reflect.defineProperty(myElement.prototype, "text", {
        get: function get() {
            return this.element.textContent;
        },
        set: function set(text) {
            this.element.textContent = text;
        }
    });

    Reflect.defineProperty(myElement.prototype, "valid", {
        get: function get() {
            return _.get(this.element, "validity.valid");
        },
        set: function set(val) {
            this.element.setCustomValidity(val ? "" : this.get("error") || "Invalid field.");
        }
    });

    Reflect.defineProperty(myElement.prototype, "value", {
        get: function get() {
            return this.element.value;
        },
        set: function set(value) {
            this.element.value = value;
        }
    });

    Reflect.defineProperty(myElement.prototype, "visible", {
        get: function get() {
            return this.element && ctx.getComputedStyle(this.element).visibility === "visible" && ctx.getComputedStyle(this.element).display !== "none";
        }
    });

    /**
     * New elements assigner
     * @param {myElement} parent parent
     * @returns {myCollection} this element
     **/
    myCollection.prototype.appendTo = function (parent) {
        var elt = parent instanceof myElement ? parent.element : parent;
        _.forEach(this.elements, function (element) {
            return element.appendTo(elt);
        });
        return this;
    };

    /**
     * Collection css stylizer
     * @param {String} styles Styles
     * @returns {myCollection} this collection
     **/
    myCollection.prototype.css = function () {
        for (var _len2 = arguments.length, styles = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            styles[_key2] = arguments[_key2];
        }

        this.elements.forEach(function (element) {
            return Reflect.apply(element.css, element, styles);
        });
        return this;
    };

    /**
     * Collection iterator
     * @param {Function} callback callback function
     * @returns {myCollection} this collection
     **/
    myCollection.prototype.each = function (callback) {
        this.elements.forEach(function (element, index) {
            return Reflect.apply(callback, null, [element, index]);
        });
        return this;
    };

    /**
     * Get element from collection
     * @param {Number} index index of element
     * @returns {myElement} indexed element
     **/
    myCollection.prototype.get = function (index) {
        return _.isNumber(index) && index < this.length ? this.elements[index] : null;
    };

    /**
     * index of elt in collection
     * @param {myElement} elt elemnt to find
     * @returns {Number} index of elt
     **/
    myCollection.prototype.indexOf = function (elt) {
        if (_.isString(elt)) {
            elt = dom.one(elt);
        }
        return _.findIndex(this.elements, function (test) {
            return _.isEqual(test, elt);
        });
    };

    /**
     * Collection observer
     * @param {String} eventsName Events name
     * @param {Object} data data
     * @param {Function} callback Callback Function
     * @returns {myCollection} this Collection
     **/
    myCollection.prototype.observe = function (eventsName, data, callback) {
        if (_.isFunction(data) && _.isUndefined(callback)) {
            callback = data;
            data = null;
        }
        this.elements.forEach(function (element) {
            return Reflect.apply(myElement.prototype.observe, element, [eventsName, data, callback]);
        });
        return this;
    };

    /**
     * Remove HTMLCollection
     * @returns {myElement} this element
     **/
    myCollection.prototype.remove = function () {
        this.elements.forEach(function (element) {
            return element.remove();
        });
        return this;
    };

    /**
     * Multiple attributes setter
     * @param {Object} attrs list of attributes
     * @param {String} value value
     * @returns {myCollection} this collection
     **/
    myCollection.prototype.set = function (attr, value) {
        this.elements.forEach(function (element) {
            return Reflect.apply(element.set, element, [attr, value]);
        });
        return this;
    };

    /**
     * Collection classes toggler
     * @param {String} classes Classes list
     * @returns {myCollection} this collection
     **/
    myCollection.prototype.toggleClass = function () {
        for (var _len3 = arguments.length, classes = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            classes[_key3] = arguments[_key3];
        }

        this.elements.forEach(function (element) {
            return Reflect.apply(element.toggleClass, element, classes);
        });
        return this;
    };

    /**
     * Collection remove listener
     * @param {String} eventsName Events name
     * @param {Object} data data
     * @param {Function} callback Callback Function
     * @returns {myCollection} this Collection
     **/
    myCollection.prototype.unobserve = function (eventsName, fn, capture) {
        this.elements.forEach(function (element) {
            return Reflect.apply(myElement.prototype.unobserve, element, [eventsName, fn, capture]);
        });
        return this;
    };

    /**
     * Collection remove  all listeners
     * @param {String} eventName Event name
     * @returns {myCollection} this Collection
     **/
    myCollection.prototype.unobserveAll = function (eventName) {
        this.elements.forEach(function (element) {
            return Reflect.apply(myElement.prototype.unobserveAll, element, [eventName]);
        });
        return this;
    };

    Reflect.defineProperty(myCollection.prototype, "length", {
        get: function get() {
            return this.elements.length;
        },
        set: function set(len) {
            if (_.isNumber(len) && len > 0 && len < this.length) {
                this.elements = this.elements.slice(0, len);
            }
            return this;
        }
    });

    ctx.µ = dom;
}).call(undefined);
