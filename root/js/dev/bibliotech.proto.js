Array.prototype.assign = function (tab) {
    this.push.apply(this, Array.isArray(tab) ? tab : [tab]);
    return this;
};
Array.prototype.noSpace = function () {
    for (var jta=0, lg = this.length; jta < lg; jta++) { if (typeof this[jta] === "string") { this[jta] = this[jta].noSpace(); }}
    return this;
};

HTMLElement.prototype.closest = function (classe) {
    var parent = this;
    while (!!parent && !!parent.tagName && parent.tagName.toLowerCase() !== "body") { if (!!parent.hasClass(classe)) { return parent; } else { parent = parent.parentNode; }}
    return null;
};
HTMLElement.prototype.css = function (style) {
    var self = this;
    if (_.isPlainObject(style)) { _.forEach(style, function (value, key) {
        if (_.includes(["width", "max-width", "height", "max-height", "top", "left", "bottom", "padding-top"], key) && value.toString().indexOf("%") === -1) { value += "px"; }
        self.style[key] = value;
    });}
    return self;
};
HTMLElement.prototype.fade = function (display) {
    display = typeof display === "undefined" ? !this.isVisible() : display;
    var elt = this, cls = !!display ? "fadein" : "fadeout";
    return new Promise(function (resolve) {
        if (!!display) { elt.toggleClass("notdisplayed", false); }
        elt.setEvents({ "animationend": function end(event) {
            resolve(elt);
            elt.removeEvent("animationend", end).toggleClass(cls, false);
            if (!display) { elt.toggleClass("notdisplayed", true); }
        }}).toggleClass(cls, true);
    });
};
HTMLElement.prototype.formToJson = function () {
    var values = {};
    this.querySelectorAll("input, textarea").forEach(function() {
        if (!!_.includes(["checkbox", "radio"], this.type.toLowerCase()) && !!this.checked || !_.includes(["checkbox", "radio"], this.type.toLowerCase()) && !!this.name) {
            values[this.name] = this.value;
        }});
    return values;
};
HTMLElement.prototype.hasClass = function (cl) { return this.classList.contains(cl); };
HTMLElement.prototype.html = function (code) {
    if (typeof code === "undefined") { return this.innerHTML; }
    this.innerHTML = code;
    return this;
};
HTMLElement.prototype.index = function () {
    var brothers = this.parentNode.childNodes;
    for (var jta = 0, lg = brothers.length; jta < lg; jta++) {
        if (brothers[jta] === this) { return jta; }
    }
    return -1;
};
HTMLElement.prototype.isVisible = function () { return this.offsetWidth > 0 && this.offsetHeight > 0; };
HTMLElement.prototype.newElement = function (type, attributes) {
    var elt = document.createElement(type);
    if (_.isPlainObject(attributes)) { elt.setAttributes(attributes); }
    this.appendChild(elt);
    return elt;
};
StyleSheetList.prototype.removeAll = HTMLElement.prototype.removeAll = function () {
    if (this.remove) { this.remove(); } else { this.parentNode.removeChild(this); }
    return this;
};
HTMLElement.prototype.removeAttributes = function (attrs) {
    var self = this;
    if (typeof attrs === "string") { attrs = [attrs]; }
    if (_.isArray(attrs)) { attrs.forEach(function (attr) { self.removeAttribute(attr); }); }
    return self;
};
HTMLElement.prototype.removeEvent = function (evt, fn) {
    this.removeEventListener(evt, fn);
    return this;
};
HTMLElement.prototype.setAttributes = function (attrs) {
    var self = this;
    if (_.isPlainObject(attrs)) { _.forEach(attrs, function (value, key) { self.setAttribute(key, value); }); }
    return self;
};
Window.prototype.setEvents = HTMLDocument.prototype.setEvents = HTMLElement.prototype.setEvents = function (evts, listener, capt) {
    var self = this;
    if (_.isPlainObject(evts)) { _.forEach(evts, function (value, key) { self.setEvents(key, value, capt); }); return self; }
    self.addEventListener(evts, listener, capt);
    return self;
};
HTMLElement.prototype.setValue = function (value) {
    this.value = value;
    return this;
};
HTMLElement.prototype.siblings = function (selector) {
    return this.parentNode.alls(selector);
};
HTMLElement.prototype.text = function (code) {
    if (typeof code === "undefined") { return this.textContent; }
    this.textContent = code;
    return this;
};
HTMLElement.prototype.toLeft = function (display) {
    display = typeof display === "undefined" ? !this.isVisible() : display;
    var elt = this, cls = !!display ? "leftin" : "leftout";
    return new Promise(function (resolve) {
        if (!!display) { elt.toggleClass("notdisplayed", false); }
        elt.setEvents({ "animationend": function end(event) {
            resolve(elt);
            elt.removeEvent("animationend", end).toggleClass(cls, false);
            if (!display) { elt.toggleClass("notdisplayed", true); }
        }}).toggleClass(cls, true);
    });
};
HTMLElement.prototype.toggle = function (display) {
    if (typeof display === "undefined" || display === null) { display = !this.isVisible(); }
    this.toggleClass("notdisplayed", !display);
    return this;
};
HTMLElement.prototype.toggleClass = function (cls, bo) {
    var el = this;
    cls = cls.split(" ");
    var action = "toggle";
    if (typeof bo !== "undefined") { action = !!bo ? "add" : "remove"; }
    cls.forEach(function (cl) { el.classList[action](cl); });
    return el;
};
HTMLElement.prototype.trigger = function (evt) {
    var event;
    try { event = new Event(evt); }
    catch (e) {
        event = document.createEvent(_.includes(["click", "mouseenter", "mouseleave", "mouseup", "mousedown"], evt) ? "MouseEvents" : "HTMLEvents");
        event.initEvent(evt, true, true);
    }
    this.dispatchEvent(event);
    return this;
};
HTMLElement.prototype.xposition = function () {
    return !!this.parentNode && !!this.parentNode.tagName ? this.parentNode.offsetLeft : this.offsetLeft;
};

HTMLDocument.prototype.alls = HTMLCollection.prototype.alls = HTMLElement.prototype.alls = NodeList.prototype.alls = function () {
    var selects,
        selector = arguments[0],
        first = selector.substr(0, 1),
        follow = selector.substr(1, selector.length);

    if (!first || !follow) { return []; }
    if (!!follow.multiSelect()) {
        selects = this.querySelectorAll(selector);
    } else {
        switch (first) {
            case "#":
                selects = [document.getElementById(follow)];
                break;
            case "@":
                selects = document.getElementsByName(follow);
                break;
            case ".":
                selects = this.getElementsByClassName(follow);
                break;
            default:
                selects = this.getElementsByTagName(selector);
                break;
        }
    }
    return selects;
};
HTMLCollection.prototype.css = NodeList.prototype.css = function (style) {
    this.forEach(function () { this.css(this); });
    return this;
};
HTMLCollection.prototype.fade = NodeList.prototype.fade = function (display) {
    var p = [];
    this.forEach(function () { p.push(this.fade(display)); });
    return Promise.all(p);
};
HTMLCollection.prototype.forEach = NodeList.prototype.forEach = function (fn) {
    [].forEach.call(this, function (elt) { fn.apply(elt); });
    return this;
};
HTMLCollection.prototype.html = NodeList.prototype.html = function (code) {
    if (typeof code === "undefined") { return this; }
    this.forEach(function () { this.html(code); });
    return this;
};
HTMLDocument.prototype.one = HTMLCollection.prototype.one = HTMLElement.prototype.one = NodeList.prototype.one = function () {
    var selects, selector = arguments[0],
        first = selector.substr(0, 1),
        follow = selector.substr(1, selector.length);

    if (!first || !follow) { return null; }
    if (!!follow.multiSelect()) {
        selects = this.querySelector(selector);
    } else {
        switch (first) {
            case "#":
                selects = document.getElementById(follow);
                break;
            case "@":
                selects = document.getElementsByName(follow)[0];
                break;
            case ".":
                selects = this.getElementsByClassName(follow)[0];
                break;
            default:
                selects = this.getElementsByTagName(selector)[0];
                break;
        }
    }
    return selects;
};
HTMLCollection.prototype.removeAll = NodeList.prototype.removeAll = function () {
    this.forEach(function () { this.removeAll(); });
    return this;
};
HTMLCollection.prototype.removeAttributes = NodeList.prototype.removeAttributes = function (list) {
    if (typeof attrs === "string") { list = [list]; }
    this.forEach(function () { this.removeAttributes(list); });
    return this;
};
HTMLCollection.prototype.removeEvent = NodeList.prototype.removeEvent = function (evt, fn) {
    this.forEach(function () { this.removeEvent(evt, fn); });
    return this;
};
HTMLCollection.prototype.setAttributes = NodeList.prototype.setAttributes = function (attrs) {
    this.forEach(function () { this.setAttributes(attrs); });
    return this;
};
HTMLCollection.prototype.setEvents = NodeList.prototype.setEvents = function (evts, listener, capt) {
    var self = this;
    if (_.isPlainObject(evts)) { _.forEach(evts, function (value, key) { self.setEvents(key, value, capt); }); return self; }
    evts = evts.split(" ");
    self.forEach(function () {
        var el = this;
        evts.forEach(function (evt) { el.addEventListener(evt, listener, capt); });
    });
    return self;
};
HTMLCollection.prototype.setValue = NodeList.prototype.setValue = function (value) {
    this.forEach(function () { this.setValue(value); });
    return this;
};
HTMLCollection.prototype.text = NodeList.prototype.text = function (code) {
    if (typeof code === "undefined") { return this; }
    this.forEach(function () { this.text(code); });
    return this;
};
HTMLCollection.prototype.toArray = NodeList.prototype.toArray = function () {
    return [].slice.apply(this);
};
HTMLCollection.prototype.toggle = NodeList.prototype.toggle = function (display, type) {
    this.forEach(function () { this.toggle(display, type); });
    return this;
};
HTMLCollection.prototype.toggleClass = NodeList.prototype.toggleClass = function (cls, bo) {
    var self = this;
    self.forEach(function () { this.toggleClass(cls, bo); });
    return self;
};
HTMLCollection.prototype.trigger = NodeList.prototype.trigger = function (evt) {
    this.forEach(function () { this.trigger(evt); });
    return this;
};

String.prototype.fd = function () {
    var date = this.substr(0, 10).split("-");
    if (date.length === 3) { date = ((date[2].length === 1) ? "0" : "") + date[2] + "/" + ((date[1].length === 1) ? "0" : "") + date[1] + "/" + date[0]; }
    return date;
};
String.prototype.multiSelect = function () {
    return this.indexOf(" ") !== -1 || this.indexOf(",") !== -1 || this.indexOf(".") !== -1 || this.indexOf("#") !== -1 || this.indexOf(":") !== -1 || this.indexOf("]") !== -1;
};
String.prototype.noAccent = function () {
    var accent = [
            /[\300-\306]/g, /[\340-\346]/g, // A, a
            /[\310-\313]/g, /[\350-\353]/g, // E, e
            /[\314-\317]/g, /[\354-\357]/g, // I, i
            /[\322-\330]/g, /[\362-\370]/g, // O, o
            /[\331-\334]/g, /[\371-\374]/g, // U, u
            /[\321]/g, /[\361]/g, // N, n
            /[\307]/g, /[\347]/g // C, c
        ],
        noaccent = ['A','a','E','e','I','i','O','o','U','u','N','n','C','c'],
        str = this;

    for (var i = 0, lgAccent = accent.length; i < lgAccent; i++) {
        str = str.replace(accent[i], noaccent[i]);
    }
    return str;
};
String.prototype.noSpace = function () {
    return this.replace(/^\s+/g,"").replace(/\s+$/g,"").replace(/\s{2,}/g, " ");
};
