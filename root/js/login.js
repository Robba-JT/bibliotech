if(Array.prototype.assign=function(a){return this.push.apply(this,Array.isArray(a)?a:[a]),this},Array.prototype.noSpace=function(){for(var a=0,b=this.length;b>a;a++)"string"==typeof this[a]&&(this[a]=this[a].noSpace());return this},HTMLElement.prototype.closest=function(a){for(var b=this;b&&b.tagName&&"body"!==b.tagName.toLowerCase();){if(b.hasClass(a))return b;b=b.parentNode}return null},HTMLElement.prototype.css=function(a){var b=this;return _.isPlainObject(a)&&_.forEach(a,function(a,c){_.includes(["width","max-width","height","max-height","top","left","bottom","padding-top"],c)&&-1===a.toString().indexOf("%")&&(a+="px"),b.style[c]=a}),this},HTMLElement.prototype.fade=function(a){var b=this,c="undefined"==typeof a?!b.isVisible():a,d=b.style.opacity;return new Promise(function(a){c&&(b.toggle(!0),d=0);var e=setInterval(function(){c?d>=(c||1)?(clearInterval(e),a(b)):b.style.opacity=(d+=.05).toFixed(2):0>=d?(clearInterval(e),b.toggle(!1),a(b)):b.style.opacity=(d-=.05).toFixed(2)},5)})},HTMLElement.prototype.formToJson=function(){var a={};return this.querySelectorAll("input, textarea").forEach(function(){(_.includes(["checkbox","radio"],this.type.toLowerCase())&&this.checked||!_.includes(["checkbox","radio"],this.type.toLowerCase())&&this.name)&&(a[this.name]=this.value)}),a},HTMLElement.prototype.hasClass=function(a){return this.classList.contains(a)},HTMLElement.prototype.html=function(a){return"undefined"==typeof a?this.innerHTML:(this.innerHTML=a,this)},HTMLElement.prototype.index=function(){for(var a=this.parentNode.childNodes,b=0,c=a.length;c>b;b++)if(a[b]===this)return b;return-1},HTMLElement.prototype.isVisible=function(){return this.offsetWidth>0&&this.offsetHeight>0},HTMLElement.prototype.newElement=function(a,b){var c=document.createElement(a);return _.isPlainObject(b)&&c.setAttributes(b),this.appendChild(c),c},StyleSheetList.prototype.removeAll=HTMLElement.prototype.removeAll=function(){return this.remove?this.remove():this.parentNode.removeChild(this),this},HTMLElement.prototype.removeAttributes=function(a){var b=this;return"string"==typeof a&&(a=[a]),_.isArray(a)&&a.forEach(function(a){b.removeAttribute(a)}),this},HTMLElement.prototype.setAttributes=function(a){var b=this;return _.isPlainObject(a)&&_.forEach(a,function(a,c){b.setAttribute(c,a)}),this},Window.prototype.setEvents=HTMLDocument.prototype.setEvents=HTMLElement.prototype.setEvents=function(a,b,c){var d=this;return _.isPlainObject(a)?(_.forEach(a,function(a,b){d.setEvents(b,a,c)}),d):(d.addEventListener(a,b,c),d)},HTMLElement.prototype.setValue=function(a){return this.value=a,this},HTMLElement.prototype.siblings=function(a){return this.parentNode.alls(a)},HTMLElement.prototype.text=function(a){return"undefined"==typeof a?this.textContent:(this.textContent=a,this)},HTMLElement.prototype.toLeft=function(a){var b=this,c="undefined"==typeof a?b.offsetLeft<0:a,d=b.clientWidth,e=5;return new Promise(function(a){c&&b.toggle(!0);var f=setInterval(function(){c?b.offsetLeft>d?(clearInterval(f),a(b)):b.css({left:b.offsetLeft+e}):b.offsetLeft<-d?(clearInterval(f),b.toggle(!1),a(b)):b.css({left:b.offsetLeft-e})},5)})},HTMLElement.prototype.toggle=function(a){return("undefined"==typeof a||null===a)&&(a=!this.isVisible()),this.toggleClass("notdisplayed",!a),this},HTMLElement.prototype.toggleClass=function(a,b){var c=this;a=a.split(" ");var d="toggle";return"undefined"!=typeof b&&(d=b?"add":"remove"),a.forEach(function(a){c.classList[d](a)}),this},HTMLElement.prototype.trigger=function(a){var b;try{b=new Event(a)}catch(c){b=document.createEvent(_.includes(["click","mouseenter","mouseleave","mouseup","mousedown"],a)?"MouseEvents":"HTMLEvents"),b.initEvent(a,!0,!0)}return this.dispatchEvent(b),this},HTMLElement.prototype.xposition=function(){return this.parentNode&&this.parentNode.tagName?this.parentNode.offsetLeft:this.offsetLeft},HTMLDocument.prototype.alls=HTMLCollection.prototype.alls=HTMLElement.prototype.alls=NodeList.prototype.alls=function(){var a,b=arguments[0],c=b.substr(0,1),d=b.substr(1,b.length);if(!c||!d)return[];if(d.multiSelect())a=this.querySelectorAll(b);else switch(c){case"#":a=[document.getElementById(d)];break;case"@":a=document.getElementsByName(d);break;case".":a=this.getElementsByClassName(d);break;default:a=this.getElementsByTagName(b)}return a},HTMLCollection.prototype.css=NodeList.prototype.css=function(a){return this.forEach(function(){this.css(this)}),this},HTMLCollection.prototype.fade=NodeList.prototype.fade=function(a){var b=[];return this.forEach(function(){b.push(this.fade(a))}),Promise.all(b)},HTMLCollection.prototype.forEach=NodeList.prototype.forEach=function(a){return[].forEach.call(this,function(b){a.call(b)}),this},HTMLCollection.prototype.html=NodeList.prototype.html=function(a){return"undefined"==typeof a?this:(this.forEach(function(){this.html(a)}),this)},HTMLDocument.prototype.one=HTMLCollection.prototype.one=HTMLElement.prototype.one=NodeList.prototype.one=function(){var a,b=arguments[0],c=b.substr(0,1),d=b.substr(1,b.length);if(!c||!d)return null;if(d.multiSelect())a=this.querySelector(b);else switch(c){case"#":a=document.getElementById(d);break;case"@":a=document.getElementsByName(d)[0];break;case".":a=this.getElementsByClassName(d)[0];break;default:a=this.getElementsByTagName(b)[0]}return a},HTMLCollection.prototype.removeAll=NodeList.prototype.removeAll=function(){return this.forEach(function(){this.removeAll()}),this},HTMLCollection.prototype.removeAttributes=NodeList.prototype.removeAttributes=function(a){return"string"==typeof attrs&&(a=[a]),this.forEach(function(){this.removeAttributes(a)}),this},HTMLCollection.prototype.setAttributes=NodeList.prototype.setAttributes=function(a){return this.forEach(function(){this.setAttributes(a)}),this},HTMLCollection.prototype.setEvents=NodeList.prototype.setEvents=function(a,b,c){var d=this;return _.isPlainObject(a)?(_.forEach(a,function(a,b){d.setEvents(b,a,c)}),d):(a=a.split(" "),d.forEach(function(){var d=this;a.forEach(function(a){d.addEventListener(a,b,c)})}),d)},HTMLCollection.prototype.setValue=NodeList.prototype.setValue=function(a){return this.forEach(function(){this.setValue(a)}),this},HTMLCollection.prototype.text=NodeList.prototype.text=function(a){return"undefined"==typeof a?this:(this.forEach(function(){this.text(a)}),this)},HTMLCollection.prototype.toArray=NodeList.prototype.toArray=function(){return[].slice.call(this)},HTMLCollection.prototype.toggle=NodeList.prototype.toggle=function(a,b){return this.forEach(function(){this.toggle(a,b)}),this},HTMLCollection.prototype.toggleClass=NodeList.prototype.toggleClass=function(a,b){return this.forEach(function(){this.toggleClass(a,b)}),this},HTMLCollection.prototype.trigger=NodeList.prototype.trigger=function(a){return this.forEach(function(){this.trigger(a)}),this},String.prototype.fd=function(){var a=this.substr(0,10).split("-");return 3===a.length&&(a=(1===a[2].length?"0":"")+a[2]+"/"+(1===a[1].length?"0":"")+a[1]+"/"+a[0]),a},String.prototype.multiSelect=function(){return-1!==this.indexOf(" ")||-1!==this.indexOf(",")||-1!==this.indexOf(".")||-1!==this.indexOf("#")||-1!==this.indexOf(":")||-1!==this.indexOf("]")},String.prototype.noSpace=function(){return this.replace(/^\s+/g,"").replace(/\s+$/g,"").replace(/\s{2,}/g," ")},window.FileReader&&window.Promise&&"formNoValidate"in document.createElement("input")){var µ=document,checkValid=function(){var a;switch(this.setCustomValidity(""),this.name){case"b":a=this.isVisible()&&this.value.length<4;break;case"c":a=this.value.length<4||this.value.length>12;break;case"d":a=this.isVisible()&&this.value!==µ.one("[name=c]").value}a&&this.setCustomValidity(this.getAttribute("m"))},getLabel=function(a){µ.alls("[type=button]").forEach(function(){this.value=this.getAttribute(a?"k":"j")})},googleApi=function(){gapi.signin.render("f",{clientid:"216469168993-dqhiqllodmfovgtrmjdf2ps5kj0h1gg9.apps.googleusercontent.com",cookiepolicy:"none",scope:"https://www.googleapis.com/auth/plus.me https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/books",width:"wide",redirecturi:"postmessage",accesstype:"offline",callback:function(a){a.code&&sendRequest("/googleAuth",{c:a.code},function(a){return a&&a.success?window.location.reload(!0):!1})}})},razError=function(){µ.alls(".g, .m").toggle(!1),µ.one(".g").html("")},sendRequest=function(a,b,c){var d=new XMLHttpRequest;d.open("POST",a,!0),d.setRequestHeader("Content-Type","application/json"),d.onreadystatechange=function(){return 4===d.readyState&&200===d.status?(c(JSON.parse(d.responseText)),!1):void 0},d.send(JSON.stringify(b))};!function(){var a=µ.createElement("script");a.type="text/javascript",a.async=!0,a.src="https://apis.google.com/js/client:plusone.js?onload=googleApi";var b=µ.one("script");b.parentNode.insertBefore(a,b)}(),µ.addEventListener("DOMContentLoaded",function(a){"use strict";µ.one("section").toggle(!0),µ.one("div").toggle(!1),µ.alls("input").setEvents("input propertychange",checkValid),µ.one("form").setEvents("submit",function(a){return a.preventDefault(),razError(),µ.one("div").fade(.5),sendRequest(µ.one("[h]").isVisible()?"/new":"/login",this.formToJson(),function(a){return a&&a.success?window.location.reload(!0):(µ.alls("[type=email], [type=password], [type=text]").toggleClass("e",!0),µ.one("div").fade(!1),µ.one("[type=email]").focus(),µ.one(".g").html(a.error),µ.alls(".g, .m").fade(!0),!1)}),!1}),µ.alls("[type=email],[type=password]").setEvents("change",razError),µ.alls("[type=button]").setEvents("click",function(){razError();var a=!µ.one("[h]").isVisible();getLabel(a),µ.alls("[h]").setValue(""),a?µ.alls("[h]").setAttributes({required:!0}):µ.alls("[h]").removeAttributes("required"),µ.alls("[h]").fade(),µ.one("[type=email]").focus()}),µ.one(".m").setEvents("click",function(){var a=this;a.setAttribute("disabled",!0),a.classList.add("l"),sendRequest("/mail",µ.one("form").formToJson(),function(b){return a.classList.remove("l"),!1})})})}else document.one("div").toggleClass("notdisplayed"),alert("Votre navigateur n'est pas compatible!!!");
