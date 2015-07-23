Array.prototype.noSpace = function () {
    for (var jta=0, lg = this.length; jta < lg; jta++) { if (typeof this[jta] === "string") { this[jta] = this[jta].noSpace(); }}
    return this;
};

Element.prototype.closest = function (classe) {
    var parent = this;
    while (!!parent && !!parent.tagName && parent.tagName.toLowerCase() !== "body") { if (!!parent.hasClass(classe)) { return parent; } else { parent = parent.parentNode; }}
    return null;
};
Element.prototype.css = function (style) {
    var self = this;
    if (_.isPlainObject(style)) { _.forEach(style, function (value, key) {
        if (_.includes(["width", "max-width", "height", "max-height", "top", "left", "bottom", "padding-top"], key) && value.toString().indexOf("%") === -1) { value += "px"; }
        self.style[key] = value;
    });}
    return this;
};
Element.prototype.fade = function (display) {
    var elt = this, eltd = typeof display === "undefined" ? !elt.isVisible() : display, op = elt.style.opacity;
    return new Promise(function (resolve) {
        if (!!eltd) { elt.toggle(true); op = 0; }
        var timer = setInterval(function () {
            if (!!eltd) {
                if (op >= (eltd || 1)) { clearInterval(timer); resolve(elt); } else { elt.style.opacity = (op += 0.05).toFixed(2); }
            } else {
                if (op <= 0) { clearInterval(timer); elt.toggle(false); resolve(elt); } else { elt.style.opacity = (op -= 0.05).toFixed(2); }
            }
        }, 10);
    });
};
Element.prototype.formToJson = function () {
    var values = {};
    this.querySelectorAll("input, textarea").forEach(function() {
        if (!!_.includes(["checkbox", "radio"], this.type.toLowerCase()) && !!this.checked || !_.includes(["checkbox", "radio"], this.type.toLowerCase()) && !!this.name) {
            values[this.name] = this.value;
        }});
    return values;
};
Element.prototype.hasClass = function (cl) { return this.classList.contains(cl); };
Element.prototype.html = function (code) {
    if (typeof code === "undefined") { return this.innerHTML; }
    this.innerHTML = code;
    return this;
};
Element.prototype.index = function () {
    var brothers = this.parentNode.childNodes;
    for (var jta = 0, lg = brothers.length; jta < lg; jta++) {
        if (brothers[jta] === this) { return jta; }
    }
    return -1;
};
Element.prototype.isVisible = function () { return this.offsetWidth > 0 && this.offsetHeight > 0; };
Element.prototype.newElement = function (type, attributes) {
    var elt = document.createElement(type);
    if (_.isPlainObject(attributes)) { elt.setAttributes(attributes); }
    this.appendChild(elt);
    return elt;
};
Element.prototype.removeAttributes = function (attrs) {
    var self = this;
    if (typeof attrs === "string") { attrs = [attrs]; }
    if (_.isArray(attrs)) { attrs.forEach(function (attr) { self.removeAttribute(attr); }); }
    return this;
};
Element.prototype.setAttributes = function (attrs) {
    var self = this;
    if (_.isPlainObject(attrs)) { _.forEach(attrs, function (value, key) { self.setAttribute(key, value); }); }
    return this;
};
Element.prototype.setEvent = function (evts, listener, capt) {
    var self = this;
    if (_.isPlainObject(evts)) { _.forEach(evts, function (value, key) { self.setEvent(key, value, capt); }); return self; }
    this.addEventListener(evts, listener, capt);
    return this;
};
Element.prototype.siblings = function (selector) {
    return this.parentNode.all(selector);
};
Element.prototype.text = function (code) {
    if (typeof code === "undefined") { return this.textContent; }
    this.textContent = code;
    return this;
};
Element.prototype.toggle = function (display) {
    if (typeof display === "undefined" || display === null) { display = !this.isVisible(); }
    this.toggleClass("notdisplayed", !display);
    return this;
};
Element.prototype.trigger = function (evt) {
    var event;
    try { event = new Event(evt); }
    catch (e) {
        event = document.createEvent(_.includes(["click", "mouseenter", "mouseleave", "mouseup", "mousedown"], evt) ? "MouseEvents" : "HTMLEvents");
        event.initEvent(evt, true, true);
    }
    this.dispatchEvent(event);
    return this;
};
Element.prototype.xposition = function () {
    return !!this.parentNode && !!this.parentNode.tagName ? this.parentNode.offsetLeft : this.offsetLeft;
};

Object.prototype.all = function () {
    var self = !this || this === window ? document : this,
        selects,
        selector = arguments[0],
        first = selector.substr(0, 1),
        follow = selector.substr(1, selector.length);

    if (!first || !follow) { return []; }
    if (!!follow.multiSelect()) {
        selects = self.querySelectorAll(selector);
    } else {
        switch (first) {
            case "#":
                selects = [document.getElementById(follow)];
                break;
            case "@":
                selects = document.getElementsByName(follow);
                break;
            case ".":
                selects = self.getElementsByClassName(follow);
                break;
            default:
                selects = self.getElementsByTagName(selector);
                break;
        }
    }
    return selects;
};
Object.prototype.css = function (style) {
    this.forEach(function () { this.css(this); });
    return this;
};
Object.prototype.fade = function (display) {
    var p = [];
    this.forEach(function () { p.push(this.fade(display)); });
    return Promise.all(p);
};
Object.prototype.forEach = function (fn) {
    var self = this;
    if (typeof self.length === "undefined" || self === window) { self = [self]; }
    [].forEach.call(self, function (elt) { fn.call(elt); });
    return this;
};
Object.prototype.html = function (code) {
    if (typeof code === "undefined") { return this; }
    this.forEach(function () { this.html(code); });
    return this;
};
/*Object.prototype.map = function (fn) {
    var self = this;
    if (typeof self.length === "undefined") { self = [self]; }
    [].map.call(self, function (elt) { fn.call(elt); });
    return this;
};*/
Object.prototype.one = function () {
    var self = !this || this === window ? document : this, selects, selector = arguments[0], first = selector.substr(0, 1), follow = selector.substr(1, selector.length);
    if (!first || !follow) { return null; }
    if (!!follow.multiSelect()) {
        selects = self.querySelector(selector);
    } else {
        switch (first) {
            case "#":
                selects = document.getElementById(follow);
                break;
            case "@":
                selects = document.getElementsByName(follow)[0];
                break;
            case ".":
                selects = self.getElementsByClassName(follow)[0];
                break;
            default:
                selects = self.getElementsByTagName(selector)[0];
                break;
        }
    }
    return selects;
};
Object.prototype.removeAll = function () {
    this.forEach(function () { if (this.remove) { this.remove(); } else { this.parentNode.removeChild(this); }});
    return this;
};
Object.prototype.removeAttributes = function (list) {
    if (typeof attrs === "string") { list = [list]; }
    this.forEach(function () { this.removeAttributes(list); });
    return this;
};
Object.prototype.setAttributes = function (attrs) {
    this.forEach(function () { this.setAttributes(attrs); });
    return this;
};
Object.prototype.setEvents = function (evts, listener, capt) {
    var self = this;
    if (_.isPlainObject(evts)) { _.forEach(evts, function (value, key) { self.setEvents(key, value, capt); }); return self; }
    evts = evts.split(" ");
    self.forEach(function () {
        var el = this;
        evts.forEach(function (evt) { el.addEventListener(evt, listener, capt); });
    });
    return self;
};
Object.prototype.text = function (code) {
    if (typeof code === "undefined") { return this; }
    this.forEach(function () { this.text(code); });
    return this;
};
Object.prototype.toArray = function () {
    return [].slice.call(this);
};
Object.prototype.toggle = function (display, type) {
    this.forEach(function () { this.toggle(display, type); });
    return this;
};
Object.prototype.toggleClass = function (cls, bo) {
    cls = cls.split(" ");
    var action = "toggle";
    if (typeof bo !== "undefined") { action = !!bo ? "add" : "remove"; }
    this.forEach(function () { var el = this; cls.forEach(function (cl) { el.classList[action](cl); }); });
    return this;
};
Object.prototype.trigger = function (evt) {
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
String.prototype.noSpace = function () {
    return this.replace(/^\s+/g,"").replace(/\s+$/g,"");
};
