"use strict";var µ=function(){var a={},b=function d(a){return a instanceof d?a:((a instanceof HTMLElement||a instanceof Document||a instanceof Window)&&(this.element=a,this.name=a.name,this.tag=_.toUpper(a.tagName),this.id=a.id,this.classes=a.classList,this.value=a.value),this)},c=function e(a){var c=this;return a instanceof e?a:(this.elements=[],Reflect.apply(Array.prototype.forEach,a,[function(a){c.elements.push(a instanceof b?a:new b(a))}]),this)};return a["new"]=function(a,c){var d=new b(document.createElement(a));return _.isPlainObject(c)?d.set(c):_.isString(c)&&(d.html=c),d},a.many=function(a){var d=arguments.length>1&&void 0!==arguments[1]?arguments[1]:document;return d instanceof b&&(d=d.element),new c(a instanceof HTMLCollection||a instanceof NodeList?a:d.querySelectorAll(a))},a.one=function(a){var c=arguments.length>1&&void 0!==arguments[1]?arguments[1]:document;return _.isString(c)?c=document.querySelector(c):c instanceof b&&(c=c.element),new b(a instanceof HTMLElement||a instanceof Document||a instanceof Window?a:c.querySelector(a))},a.rgbToHex=function(a){return"#"+((1<<24)+(a[0]<<16)+(a[1]<<8)+a[2]).toString(16).substr(1)},a.isDark=function(a){return.3*a[0]+.59*a[1]+.11*a[2]<=128},Reflect.defineProperty(c.prototype,"length",{get:function(){return this.elements.length},set:function(a){return _.isNumber(a)&&a>0&&a<this.length&&(this.elements=this.elements.slice(0,a)),this}}),Reflect.defineProperty(b.prototype,"exists",{get:function(){return Boolean(this.element)}}),Reflect.defineProperty(b.prototype,"files",{get:function(){return this.element&&this.element.files||[]}}),Reflect.defineProperty(b.prototype,"checked",{get:function(){return this.element.checked},set:function(a){this.element.checked=Boolean(a)}}),Reflect.defineProperty(b.prototype,"loaded",{get:function(){return this.element.onload},set:function(a){var b=this;"IMG"===this.tag&&_.isFunction(a)&&(this.element.onload=function(){Reflect.apply(a,b,[])})}}),Reflect.defineProperty(b.prototype,"parent",{get:function(){return a.one(this.element.parentNode)}}),Reflect.defineProperty(b.prototype,"siblings",{get:function(){var b=a.many(this.element.parentNode.children);return _.remove(b.elements,this),b}}),Reflect.defineProperty(b.prototype,"visible",{get:function(){return this.element&&"visible"===window.getComputedStyle(this.element).visibility&&"none"!==window.getComputedStyle(this.element).display}}),b.prototype.one=function(b){return a.one(b,this)},b.prototype.reload=function(){var a=arguments.length>0&&void 0!==arguments[0]?arguments[0]:!1;return a=Boolean(a),this.element instanceof Document?this.element.location.reload(a):this.element instanceof HTMLIFrameElement&&this.element.contentWindow.location.reload(a),this},b.prototype.many=function(b){return a.many(b,this)},c.prototype.get=function(a){return _.isNumber(a)&&a<this.length?this.elements[a]:null},c.prototype.set=function(a,b){return this.elements.forEach(function(c){return Reflect.apply(c.set,c,[a,b])}),this},c.prototype.indexOf=function(b){return _.isString(b)&&(b=a.one(b)),_.findIndex(this.elements,function(a){return _.isEqual(a,b)})},b.prototype.observe=function(a){for(var b=this,c=arguments.length,d=Array(c>1?c-1:0),e=1;c>e;e++)d[e-1]=arguments[e];var f=d[0],g=d[1],h=d[2],i=void 0===h?!1:h;return _.isFunction(f)&&(i=g||!1,g=f,f=null),_.has(this,"element")&&a.split(",").forEach(function(a){b.element.addEventListener(a.trim(),function(a){return a.data=f,a.element=b,Reflect.apply(g,b,[a])},i)}),this},b.prototype.css=function(a,b){var c=this;if(_.isString(a)){if(_.isUndefined(b))return _.get(this,"element.style."+a);var d={};d[a]=b,a=d}if(_.isPlainObject(a))for(var e in a)this.element&&!function(){var b=_.kebabCase(e),d=_.split(_.toString(a[e])," ");d.forEach(function(a,b){isNaN(Number(a))||_.has(a,"%")||_.has(a,"px")||(d[b]=a+"px")}),c.element.style[b]=d.join(" ")}();return this},b.prototype.style=function(a){return _.get(this.element,a?"style."+a:"style")},b.prototype.toggleClass=function(a,b){var c=this;if(_.has(this,"element")){var d=_.isUndefined(b)?"toggle":b&&"add"||"remove";Array.isArray(a)||(a=a.split(" ")),a.forEach(function(a){c.element&&c.element.classList[d](a)})}return this},b.prototype.parser=function(){var a=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};if("FORM"===this.tag)try{this.many("input").each(function(b){_.has(b,"name")&&b.name&&b.value&&("checkbox"===b.get("type")?a[b.name]=b.checked:("radio"!==b.get("type")||b.checked===!0)&&(a[b.name]=b.value))})}catch(b){throw new Error("Invalid FORM Element")}return a},b.prototype.reset=function(){var a=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};if("FORM"===this.tag){this.element.reset();for(var b in a)_.has(a,b)&&this.one("[name="+b+"]").set("value",a[b])}return this},b.prototype.hasClass=function(a){return this.classes.contains(a)},Reflect.defineProperty(b.prototype,"value",{get:function(){return this.element.value},set:function(a){this.element.value=a}}),Reflect.defineProperty(b.prototype,"html",{get:function(){return this.element&&this.element.innerHTML||""},set:function(a){this.element&&(this.element.innerHTML=a)}}),Reflect.defineProperty(b.prototype,"valid",{get:function(){return _.get(this.element,"validity.valid")},set:function(a){a?this.element.setCustomValidity(""):this.element.setCustomValidity("error input")}}),b.prototype.focus=function(){return this.element&&this.element.focus(),this},Reflect.defineProperty(b.prototype,"text",{get:function(){return this.element.textContent},set:function(a){this.element.textContent=a}}),b.prototype.get=function(a){var b=null;return this.element&&(b=this.element[a]||Reflect.apply(this.element.getAttribute,this.element,[a])),b},b.prototype.set=function(a,b){if(_.isString(a)&&!_.isUndefined(b)){var c={};c[a]=b,a=c}if(_.isPlainObject(a))for(var d in a)d in this.element?this.element[d]=a[d]:this.element.setAttribute(d,a[d]);return this},b.prototype.unset=function(a){var b=this;return _.isString(a)&&(a=[a]),a.forEach(function(a){b.element.removeAttribute(a)}),this},b.prototype.append=function(d,e){var f=this;if(d instanceof c||_.isArray(d)){var g=d.elements||d;return _.forEach(g,function(a){f.element.appendChild(a.set(e).element)}),this}var h=d instanceof HTMLElement||d instanceof b?d.set(e):a["new"](d,e);return this.element.appendChild(h.element),h},b.prototype.insertFirst=function(d,e){var f=this;if(d instanceof c||_.isArray(d)){var g=d.elements||d;return _.forEach(g,function(a){f.element.insertAdjacentElement("afterbegin",a.set(e).element)}),this}var h=d instanceof HTMLElement||d instanceof b?d.set(e):a["new"](d,e);return this.element.insertAdjacentElement("afterbegin",h.element),h},b.prototype.appendTo=function(a){var c=a instanceof b?a.element:a;return c.appendChild(this.element),this},c.prototype.appendTo=function(a){var c=a instanceof b?a.element:a;return _.forEach(this.elements,function(a){return a.appendTo(c)}),this},b.prototype.prepend=function(c,d){var e=c instanceof HTMLElement||c instanceof b?c.set(d):a["new"](c,d),f=this.parent;return f.element.insertBefore(e.element,this.element),e},b.prototype.textNode=function(a){var b=document.createTextNode(a);return this.element.appendChild(b),b},b.prototype.remove=function(){return this.element&&this.element.parentNode.removeChild(this.element),this},b.prototype.trigger=function(a){if(this.element)if(this.element[a]&&_.isFunction(this.element[a]))Reflect.apply(this.element[a],this.element,[]);else{var b=_.has(["click","mouseenter","mouseleave","mouseup","mousedown"],a),c=null;try{c=b?new MouseEvent(a):new Event(a)}catch(d){c=document.createEvent(b?"MouseEvents":"HTMLEvents"),c.initEvent(a,!0,!0)}this.element.dispatchEvent(c)}return this},b.prototype.submit=function(){if(!_.has(this,"element")||"FORM"!==this.tag)throw new Error("Invalid FORM!");return this.element.submit(),this},c.prototype.each=function(a){return this.elements.forEach(function(b,c){return Reflect.apply(a,null,[b,c])}),this},c.prototype.toggleClass=function(){for(var a=arguments.length,b=Array(a),c=0;a>c;c++)b[c]=arguments[c];return this.elements.forEach(function(a){return Reflect.apply(a.toggleClass,a,b)}),this},c.prototype.css=function(){for(var a=arguments.length,b=Array(a),c=0;a>c;c++)b[c]=arguments[c];return this.elements.forEach(function(a){return Reflect.apply(a.css,a,b)}),this},c.prototype.remove=function(){return this.elements.forEach(function(a){return a.remove()}),this},c.prototype.observe=function(a,c,d){return _.isFunction(c)&&_.isUndefined(d)&&(d=c,c=null),this.elements.forEach(function(e){return Reflect.apply(b.prototype.observe,e,[a,c,d])}),this},a}();