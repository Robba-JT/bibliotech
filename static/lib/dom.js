"use strict";var _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(a){return typeof a}:function(a){return a&&"function"==typeof Symbol&&a.constructor===Symbol&&a!==Symbol.prototype?"symbol":typeof a};(function(){var a="object"===("undefined"==typeof global?"undefined":_typeof(global))&&global&&global.Object===Object&&global,b="object"===("undefined"==typeof self?"undefined":_typeof(self))&&self&&self.Object===Object&&self,c=a||b||Function("return this")(),d={},e=function g(a){return a instanceof g?a:((a instanceof HTMLElement||a instanceof Document||a instanceof Window)&&(this.element=a,this.name=a.name,this.tag=_.toUpper(a.tagName),this.id=a.id,this.classes=a.classList,this.value=a.value),this)},f=function h(a){var b=this;return a instanceof h?a:(this.elements=[],Reflect.apply(Array.prototype.forEach,a,[function(a){b.elements.push(a instanceof e?a:new e(a))}]),this)};d.isDark=function(a){return.3*a[0]+.59*a[1]+.11*a[2]<=128},d.many=function(a){var b=arguments.length>1&&void 0!==arguments[1]?arguments[1]:document;return b instanceof e&&(b=b.element),new f(a instanceof HTMLCollection||a instanceof NodeList?a:b.querySelectorAll(a))},d["new"]=function(a,b){var c=new e(document.createElement(a));return _.isPlainObject(b)?c.set(b):_.isString(b)&&(c.html=b),c},d.one=function(a){var b=arguments.length>1&&void 0!==arguments[1]?arguments[1]:document;return _.isString(b)?b=document.querySelector(b):b instanceof e&&(b=b.element),new e(a instanceof HTMLElement||a instanceof Document||a instanceof Window?a:b.querySelector(a))},d.rgbToHex=function(a){return"#"+((1<<24)+(a[0]<<16)+(a[1]<<8)+a[2]).toString(16).substr(1)},e.prototype.append=function(a,b){var c=this;if(a instanceof f||_.isArray(a)){var g=a.elements||a;return _.forEach(g,function(a){c.element.appendChild(a.set(b).element)}),this}var h=a instanceof HTMLElement||a instanceof e?a.set(b):d["new"](a,b);return this.element.appendChild(h.element),h},e.prototype.appendTo=function(a){var b=a instanceof e?a.element:a;return b.appendChild(this.element),this},e.prototype.css=function(a,b){var c=this;if(_.isString(a)){if(_.isUndefined(b))return _.get(this,"element.style."+a);var d={};d[a]=b,a=d}if(_.isPlainObject(a))for(var e in a)this.element&&!function(){var b=_.kebabCase(e),d=_.split(_.toString(a[e])," ");d.forEach(function(a,b){isNaN(Number(a))||_.has(a,"%")||_.has(a,"px")||(d[b]=a+"px")}),c.element.style[b]=d.join(" ")}();return this},e.prototype.focus=function(){return this.element&&this.element.focus(),this},e.prototype.get=function(a){var b=null;return this.element&&(b=this.element[a]||Reflect.apply(this.element.getAttribute,this.element,[a])),b},e.prototype.hasClass=function(a){return this.classes.contains(a)},e.prototype.insertFirst=function(a,b){var c=this;if(a instanceof f||_.isArray(a)){var g=a.elements||a;return _.forEach(g,function(a){c.element.insertAdjacentElement("afterbegin",a.set(b).element)}),this}var h=a instanceof HTMLElement||a instanceof e?a.set(b):d["new"](a,b);return this.element.insertAdjacentElement("afterbegin",h.element),h},e.prototype.many=function(a){return d.many(a,this)},e.prototype.observe=function(a){for(var b=this,c=arguments.length,d=Array(c>1?c-1:0),e=1;c>e;e++)d[e-1]=arguments[e];var f=d[0],g=d[1],h=d[2],i=void 0===h?!1:h;return _.isFunction(f)&&(i=g||!1,g=f,f=null),_.has(this,"element")&&(this.element.listeners||(this.element.listeners=[]),a.split(",").forEach(function(a){var c={event:a.trim(),callback:g,fn:function(a){return a.data=f,a.element=b,Reflect.apply(g,b,[a])},capture:i};b.element.addEventListener(c.event,c.fn,c.capture),b.element.listeners.push(c)})),this},e.prototype.one=function(a){return d.one(a,this)},e.prototype.parser=function(){var a=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};if("FORM"===this.tag)try{this.many("input").each(function(b){_.has(b,"name")&&b.name&&b.value&&("checkbox"===b.get("type")?a[b.name]=b.checked:("radio"!==b.get("type")||b.checked===!0)&&(a[b.name]=b.value))})}catch(b){throw new Error("Invalid FORM Element")}return a},e.prototype.prepend=function(a,b){var c=a instanceof HTMLElement||a instanceof e?a.set(b):d["new"](a,b),f=this.parent;return f.element.insertBefore(c.element,this.element),c},e.prototype.reload=function(){var a=arguments.length>0&&void 0!==arguments[0]?arguments[0]:!1;return a=Boolean(a),this.element instanceof Document?this.element.location.reload(a):this.element instanceof HTMLIFrameElement&&this.element.contentWindow.location.reload(a),this},e.prototype.remove=function(){return this.element&&this.element.parentNode.removeChild(this.element),this},e.prototype.reset=function(){var a=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};if("FORM"===this.tag){this.element.reset();for(var b in a)_.has(a,b)&&this.one("[name="+b+"]").set("value",a[b])}return this},e.prototype.set=function(a,b){if(_.isString(a)&&!_.isUndefined(b)){var c={};c[a]=b,a=c}if(_.isPlainObject(a))for(var d in a)d in this.element?this.element[d]=a[d]:this.element.setAttribute(d,a[d]);return this},e.prototype.style=function(a){return _.get(this.element,a?"style."+a:"style")},e.prototype.submit=function(){if(!_.has(this,"element")||"FORM"!==this.tag)throw new Error("Invalid FORM!");return this.element.submit(),this},e.prototype.textNode=function(a){var b=document.createTextNode(a);return this.element.appendChild(b),b},e.prototype.toggleClass=function(a,b){var c=this;if(_.has(this,"element")){var d=_.isUndefined(b)?"toggle":b&&"add"||"remove";Array.isArray(a)||(a=a.split(" ")),a.forEach(function(a){c.element&&c.element.classList[d](a)})}return this},e.prototype.trigger=function(a){if(this.element)if(this.element[a]&&_.isFunction(this.element[a]))Reflect.apply(this.element[a],this.element,[]);else{var b=_.has(["click","mouseenter","mouseleave","mouseup","mousedown"],a),c=null;try{c=b?new MouseEvent(a):new Event(a)}catch(d){c=document.createEvent(b?"MouseEvents":"HTMLEvents"),c.initEvent(a,!0,!0)}this.element.dispatchEvent(c)}return this},e.prototype.unobserve=function(a,b,c){if(_.has(this,"element")){var d=_.remove(this.element.listeners,["event",a,"callback",b,"capture",c]);event&&this.element.removeEventListener(d.event,d.fn,d.capture)}return this},e.prototype.unobserveAll=function(a){var b=this;return _.has(this,"element")&&_.forEach(_.remove(this.element.listeners,["event",a])||[],function(a){return b.element.removeEventListener(a.event,a.fn,a.capture)}),this},e.prototype.unset=function(a){var b=this;return _.isString(a)&&(a=[a]),a.forEach(function(a){b.element.removeAttribute(a)}),this},Reflect.defineProperty(e.prototype,"checked",{get:function(){return this.element.checked},set:function(a){this.element.checked=Boolean(a)}}),Reflect.defineProperty(e.prototype,"exists",{get:function(){return Boolean(this.element)}}),Reflect.defineProperty(e.prototype,"files",{get:function(){return this.element&&this.element.files||[]}}),Reflect.defineProperty(e.prototype,"html",{get:function(){return this.element&&this.element.innerHTML||""},set:function(a){this.element&&(this.element.innerHTML=a)}}),Reflect.defineProperty(e.prototype,"listeners",{get:function(){return this.element.listeners}}),Reflect.defineProperty(e.prototype,"loaded",{get:function(){return this.element.onload},set:function(a){var b=this;"IMG"===this.tag&&_.isFunction(a)&&(this.element.onload=function(){Reflect.apply(a,b,[])})}}),Reflect.defineProperty(e.prototype,"parent",{get:function(){return d.one(this.element.parentNode)}}),Reflect.defineProperty(e.prototype,"siblings",{get:function(){var a=d.many(this.element.parentNode.children);return _.remove(a.elements,this),a}}),Reflect.defineProperty(e.prototype,"text",{get:function(){return this.element.textContent},set:function(a){this.element.textContent=a}}),Reflect.defineProperty(e.prototype,"valid",{get:function(){return _.get(this.element,"validity.valid")},set:function(a){this.element.setCustomValidity(a?"":this.get("error")||"Invalid field.")}}),Reflect.defineProperty(e.prototype,"value",{get:function(){return this.element.value},set:function(a){this.element.value=a}}),Reflect.defineProperty(e.prototype,"visible",{get:function(){return this.element&&"visible"===c.getComputedStyle(this.element).visibility&&"none"!==c.getComputedStyle(this.element).display}}),f.prototype.appendTo=function(a){var b=a instanceof e?a.element:a;return _.forEach(this.elements,function(a){return a.appendTo(b)}),this},f.prototype.css=function(){for(var a=arguments.length,b=Array(a),c=0;a>c;c++)b[c]=arguments[c];return this.elements.forEach(function(a){return Reflect.apply(a.css,a,b)}),this},f.prototype.each=function(a){return this.elements.forEach(function(b,c){return Reflect.apply(a,null,[b,c])}),this},f.prototype.get=function(a){return _.isNumber(a)&&a<this.length?this.elements[a]:null},f.prototype.indexOf=function(a){return _.isString(a)&&(a=d.one(a)),_.findIndex(this.elements,function(b){return _.isEqual(b,a)})},f.prototype.observe=function(a,b,c){return _.isFunction(b)&&_.isUndefined(c)&&(c=b,b=null),this.elements.forEach(function(d){return Reflect.apply(e.prototype.observe,d,[a,b,c])}),this},f.prototype.remove=function(){return this.elements.forEach(function(a){return a.remove()}),this},f.prototype.set=function(a,b){return this.elements.forEach(function(c){return Reflect.apply(c.set,c,[a,b])}),this},f.prototype.toggleClass=function(){for(var a=arguments.length,b=Array(a),c=0;a>c;c++)b[c]=arguments[c];return this.elements.forEach(function(a){return Reflect.apply(a.toggleClass,a,b)}),this},f.prototype.unobserve=function(a,b,c){return this.elements.forEach(function(d){return Reflect.apply(e.prototype.unobserve,d,[a,b,c])}),this},f.prototype.unobserveAll=function(a){return this.elements.forEach(function(b){return Reflect.apply(e.prototype.unobserveAll,b,[a])}),this},Reflect.defineProperty(f.prototype,"length",{get:function(){return this.elements.length},set:function(a){return _.isNumber(a)&&a>0&&a<this.length&&(this.elements=this.elements.slice(0,a)),this}}),c.µ=d}).call(void 0);