const µ = (function () {
    const dom = {},
        sizables = [
            "width", "max-width",
            "height", "max-height",
            "top", "left", "bottom", "right",
            "border", "border-top", "border-right", "border-bottom", "border-left",
            "border-radius",
            "padding", "padding-top", "padding-right", "padding-bottom", "padding-left",
            "margin", "margin-top", "margin-right", "margin-bottom", "margin-left"
        ],
        /**
         * Element constructor
         * @param {HTMLElement} elt Element
         * @returns {Object} Element
         **/
        myElement = function (elt) {
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
        myCollection = function (elts) {
            if (elts instanceof myCollection) {
                return elts;
            }
            this.elements = [];
            Reflect.apply(Array.prototype.forEach, elts, [(elt) => {
                this.elements.push(elt instanceof myElement ? elt : new myElement(elt));
            }]);
            return this;
        };

    /**
     * Create elements
     * @param {String} tag tagName
     * @param {Object} attrs attributes list
     * @returns {myElement} new element
     **/
    dom.new = (tag, attrs) => {
        const elt = new myElement(document.createElement(tag));
        if (_.isPlainObject(attrs)) {
            elt.set(attrs);
        } else if (_.isString(attrs)) {
            elt.html = attrs;
        }
        return elt;
    };

    /**
     * DOM Collection selector
     * @param {string} selector query selector
     * @param {HTMLElement} parent parent
     * @returns {myCollection} query result
     **/
    dom.many = (selector, parent = document) => {
        if (parent instanceof myElement) {
            parent = parent.element;
        }
        return new myCollection(selector instanceof HTMLCollection || selector instanceof NodeList ? selector : parent.querySelectorAll(selector));
    };

    /**
     * DOM Element selector
     * @param {string} selector query selector
     * @param {HTMLElement} parent parent
     * @returns {myElement} query result
     **/
    dom.one = (selector, parent = document) => {
        if (_.isString(parent)) {
            parent = document.querySelector(parent);
        } else if (parent instanceof myElement) {
            parent = parent.element;
        }
        return new myElement(selector instanceof HTMLElement || selector instanceof Document || selector instanceof Window ? selector : parent.querySelector(selector));
    };

    Reflect.defineProperty(myCollection.prototype, "length", {
        get() {
            return this.elements.length;
        },
        set(len) {
            if (_.isNumber(len) && len > 0 && len < this.length) {
                this.elements = this.elements.slice(0, len);
            }
            return this;
        }
    });

    Reflect.defineProperty(myElement.prototype, "exists", {
        get() {
            return Boolean(this.element);
        }
    });

    Reflect.defineProperty(myElement.prototype, "files", {
        get() {
            return this.element && this.element.files || [];
        }
    });

    Reflect.defineProperty(myElement.prototype, "checked", {
        get() {
            return this.element.checked;
        },
        set(checked) {
            this.element.checked = Boolean(checked);
        }
    });

    Reflect.defineProperty(myElement.prototype, "loaded", {
        get() {
            return this.element.onload;
        },
        set(cb) {
            if (this.tag === "IMG" && _.isFunction(cb)) {
                this.element.onload = () => {
                    Reflect.apply(cb, this, []);
                };
            }
        }
    });

    Reflect.defineProperty(myElement.prototype, "parent", {
        get() {
            return dom.one(this.element.parentNode);
        }
    });

    Reflect.defineProperty(myElement.prototype, "siblings", {
        get() {
            const children = dom.many(this.element.parentNode.children);
            _.remove(children.elements, this);
            return children;
        }
    });

    /**
     * Unique selector in myElement
     * @param {Object} selector selector
     * @returns {myElement} selected element
     **/
    myElement.prototype.one = function (selector) {
        return dom.one(selector, this);
    };

    /**
     * Location reload
     * @param {Boolean} forceGet force GET request
     * @returns {myElement} element
     **/
    myElement.prototype.reload = function (forceGet = false) {
        forceGet = Boolean(forceGet);
        if (this.element instanceof Document) {
            this.element.location.reload(forceGet);
        } else if (this.element instanceof HTMLIFrameElement) {
            this.element.contentWindow.location.reload(forceGet);
        }
        return this;
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
     * Get element from collection
     * @param {Number} index index of element
     * @returns {myElement} indexed element
     **/
    myCollection.prototype.get = function (index) {
        return _.isNumber(index) && index < this.length ? this.elements[index] : null;
    };

    /**
     * Multiple attributes setter
     * @param {Object} attrs list of attributes
     * @param {String} value value
     * @returns {myCollection} this collection
     **/
    myCollection.prototype.set = function (attr, value) {
        this.elements.forEach((element) => Reflect.apply(element.set, element, [attr, value]));
        return this;
    };

    /**
     * Element listener prototype
     * @param {String} eventsName Events name
     * @param {Object} data data to attach
     * @param {Function} callback Callback function
     * @param {Boolean} capture capture
     * @returns {myElement} this element
     **/
    myElement.prototype.observe = function (eventsName, ...args) {
        var [
            data,
            callback,
            capture = false
        ] = args;
        if (_.isFunction(data)) {
            capture = callback || false;
            callback = data;
            data = null;
        }
        if (_.has(this, "element")) {
            eventsName.split(",").forEach((eventName) => {
                this.element.addEventListener(eventName.trim(), (event) => {
                    event.data = data;
                    event.element = this;
                    return Reflect.apply(callback, this, [event]);
                }, capture);
            });
        }
        return this;
    };

    /**
     * Element stylizer
     * @param {Object} styles Styles
     * @param {String} values values
     * @returns {myElement} this element
     **/
    myElement.prototype.css = function (styles, values) {
        if (_.isString(styles)) {
            const inter = {};
            inter[styles] = values;
            styles = inter;
        }
        if (_.isPlainObject(styles)) {
            for (const style in styles) {
                if (this.element) {
                    const kebabStyle = _.kebabCase(style),
                        trimValue = _.split(_.toString(styles[style]), " ");

                    trimValue.forEach((value, index) => {
                        if (!isNaN(Number(value)) && !_.has(value, "%") && !_.has(value, "px")) {
                            trimValue[index] = `${value}px`;
                        }
                    });
                    this.element.style[kebabStyle] = trimValue.join(" ");
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
        return _.get(this.element, style ? `style.${style}` : "style");
    };

    /**
     * Element toggle classes prototype
     * @param {ArrayString} classes Class names
     * @param {Boolean} toAdd Action
     * @returns {myElement} this element
     **/
    myElement.prototype.toggleClass = function (classes, toAdd) {
        if (_.has(this, "element")) {
            const action = _.isUndefined(toAdd) ? "toggle" : toAdd && "add" || "remove";
            if (!Array.isArray(classes)) {
                classes = classes.split(" ");
            }
            classes.forEach((cl) => {
                if (this.element) {
                    this.element.classList[action](cl);
                }
            });
        }
        return this;
    };

    /**
     * FORM Element parser prototype
     * @param {Object} obj Object values
     * @returns {myElement} this element
     **/
    myElement.prototype.parser = function (obj = {}) {
        if (this.tag === "FORM") {
            try {
                this.many("input").each((input) => {
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
     * FORM element reset
     * @params {Object} defaults default value
     * @returns {myElement} this element
     **/
    myElement.prototype.reset = function (defaults = {}) {
        if (this.tag === "FORM") {
            this.element.reset();
            for (const input in defaults) {
                if (_.has(defaults, input)) {
                    this.one(`[name=${input}]`).set("value", defaults[input]);
                }
            }
        }
        return this;
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
     * Value getter/setter
     * @param {Object} value value
     * @returns {myElement} this element
     **/
    Reflect.defineProperty(myElement.prototype, "value", {
        get() {
            return this.element.value;
        },
        set(value) {
            this.element.value = value;
        }
    });

    /**
     * HTML assigner
     * @param {String} html HTML code
     * @returns {myElement} this element
     **/
    Reflect.defineProperty(myElement.prototype, "html", {
        get() {
            return this.element.innerHTML;
        },
        set(code) {
            this.element.innerHTML = code;
        }
    });

    /**
     * is valid
     * @param {String} html HTML code
     * @returns {myElement} this element
     **/
    Reflect.defineProperty(myElement.prototype, "valid", {
        get() {
            return _.get(this.element, "validity.valid");
        }
    });

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


    /*
    myElement.prototype.text = function (text = "") {
        this.element.textContent = text;
        return this;
    };*/
    Reflect.defineProperty(myElement.prototype, "text", {
        get() {
            return this.element.textContent;
        },
        set(text) {
            this.element.textContent = text;
        }
    });

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
     * Multiple attributes setter
     * @param {Object} attrs list of attributes
     * @param {String} value value
     * @returns {myElement} this element
     **/
    myElement.prototype.set = function (attrs, value) {
        if (_.isString(attrs) && !_.isUndefined(value)) {
            const alt = {};
            alt[attrs] = value;
            attrs = alt;
        }
        if (_.isPlainObject(attrs)) {
            for (const attr in attrs) {
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
     * Unset attributes
     * @param {Array} attrs attributes
     * @returns {myElement} this element
     **/
    myElement.prototype.unset = function (attrs) {
        if (_.isString(attrs)) {
            attrs = [attrs];
        }
        attrs.forEach((attr) => {
            this.element.removeAttribute(attr);
        });
        return this;
    };

    /**
     * New element assigner
     * @param {String} tag tagName
     * @param {Object} attrs Attributes list
     * @returns {myElement} new element
     **/
    myElement.prototype.append = function (tag, attrs) {
        const elt = tag instanceof HTMLElement || tag instanceof myElement ? tag.set(attrs) : dom.new(tag, attrs);
        this.element.appendChild(elt.element);
        return elt;
    };

    /**
     * Element prepend
     * @param {String} tag tagName
     * @param {Object} attrs Attributes list
     * @returns {myElement} new element
     **/
    myElement.prototype.prepend = function (tag, attrs) {
        const elt = tag instanceof HTMLElement || tag instanceof myElement ? tag.set(attrs) : dom.new(tag, attrs),
            parent = this.parent;
        parent.element.insertBefore(elt.element, this.element);
        return elt;
    };

    /**
     * New textNode assigner
     * @param {String} text textNode
     * @returns {myElement} new element
     **/
    myElement.prototype.textNode = function (text) {
        const node = document.createTextNode(text);
        this.element.appendChild(node);
        return node;
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
     * Event trigger
     * @param {String} eventName Event name
     * @returns {myElement} this element;
     **/
    myElement.prototype.trigger = function (eventName) {
        if (this.element[eventName] && _.isFunction(this.element[eventName])) {
            Reflect.apply(this.element[eventName], this.element, []);
        } else {
            const isMouse = _.has(["click", "mouseenter", "mouseleave", "mouseup", "mousedown"], eventName);
            var thisEvent = null;
            try {
                thisEvent = isMouse ? new MouseEvent(eventName) : new Event(eventName);
            } catch (error) {
                thisEvent = document.createEvent(isMouse ? "MouseEvents" : "HTMLEvents");
                thisEvent.initEvent(eventName, true, true);
            }
            this.element.dispatchEvent(thisEvent);
        }
        return this;
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
     * Collection iterator
     * @param {Function} callback callback function
     * @returns {myCollection} this collection
     **/
    myCollection.prototype.each = function (callback) {
        this.elements.forEach((element) => Reflect.apply(callback, null, [element]));
        return this;
    };

    /**
     * Collection classes toggler
     * @param {String} classes Classes list
     * @returns {myCollection} this collection
     **/
    myCollection.prototype.toggleClass = function (...classes) {
        this.elements.forEach((element) => Reflect.apply(element.toggleClass, element, classes));
        return this;
    };

    /**
     * Collection css stylizer
     * @param {String} styles Styles
     * @returns {myCollection} this collection
     **/
    myCollection.prototype.css = function (...styles) {
        this.elements.forEach((element) => Reflect.apply(element.css, element, styles));
        return this;
    };

    /**
     * Remove HTMLCollection
     * @returns {myElement} this element
     **/
    myCollection.prototype.remove = function () {
        this.elements.forEach((element) => element.remove());
        return this;
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
        this.elements.forEach((element) => Reflect.apply(myElement.prototype.observe, element, [eventsName, data, callback]));
        return this;
    };

    return dom;
})();
