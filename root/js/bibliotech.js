if(Element.prototype.isVisible=function(){return this.offsetWidth>0&&this.offsetHeight>0},Element.prototype.formToJson=function(){var a={};return this.querySelectorAll("input, textarea").forEach(function(){(_.includes(["checkbox","radio"],this.type.toLowerCase())&&this.checked||!_.includes(["checkbox","radio"],this.type.toLowerCase())&&this.name&&this.value)&&(a[this.name]=this.value)}),a},Element.prototype.hasClass=function(a){return this.classList.contains(a)},Element.prototype.css=function(a){var b=this;return _.isPlainObject(a)&&_.forEach(a,function(a,c){_.includes(["width","max-width","height","max-height","top","left","bottom","padding-top"],c)&&-1===a.toString().indexOf("%")&&(a+="px"),b.style[c]=a}),this},Element.prototype.closest=function(a){for(var b=this;b&&b.tagName&&"body"!==b.tagName.toLowerCase();){if(b.hasClass(a))return b;b=b.parentNode}return null},Element.prototype.html=function(a){return"undefined"==typeof a?this.innerHTML:(this.innerHTML=a,this)},Element.prototype.trigger=function(a){var b;try{b=new Event(a)}catch(c){b=document.createEvent(_.includes(["click","mouseenter","mouseleave","mouseup","mousedown"],a)?"MouseEvents":"HTMLEvents"),b.initEvent(a,!0,!0)}return this.dispatchEvent(b),this},Element.prototype.setEvent=function(a,b,c){var d=this;return _.isPlainObject(a)?(_.forEach(a,function(a,b){d.setEvent(b,a,c)}),d):(this.addEventListener(a,b,c),this)},Element.prototype.siblings=function(a){return this.parentNode.all(a)},Element.prototype.toggle=function(a){return("undefined"==typeof a||null===a)&&(a=!this.isVisible()),this.toggleClass("notdisplayed",!a),this},Element.prototype.newElement=function(a,b){var c=document.createElement(a);return _.isPlainObject(b)&&c.setAttributes(b),this.appendChild(c),c},Element.prototype.index=function(){for(var a=this.parentNode.childNodes,b=0,c=a.length;c>b;b++)if(a[b]===this)return b;return-1},Element.prototype.setAttributes=function(a){var b=this;return _.isPlainObject(a)&&_.forEach(a,function(a,c){b.setAttribute(c,a)}),this},Element.prototype.removeAttributes=function(a){var b=this;return"string"==typeof a&&(a=[a]),_.isArray(a)&&_.forEach(a,function(a){b.removeAttribute(a)}),this},Object.prototype.toggleClass=function(a,b){a=a.split(" ");var c="toggle";return"undefined"!=typeof b&&(c=b?"add":"remove"),this.forEach(function(){var b=this;a.forEach(function(a){b.classList[c](a)})}),this},Object.prototype.setEvents=function(a,b,c){var d=this;return _.isPlainObject(a)?(_.forEach(a,function(a,b){d.setEvents(b,a,c)}),d):(a=a.split(" "),d.forEach(function(){var d=this;a.forEach(function(a){d.addEventListener(a,b,c)})}),d)},Object.prototype.trigger=function(a){return this.forEach(function(){this.trigger(a)}),this},Object.prototype.forEach=function(a){var b=this;return("undefined"==typeof b.length||b===window)&&(b=[b]),[].forEach.call(b,function(b){a.call(b)}),this},Object.prototype.map=function(a){var b=this;return"undefined"==typeof b.length&&(b=[b]),[].map.call(b,function(b){a.call(b)}),this},Object.prototype.removeAll=function(){return this.forEach(function(){this.remove?this.remove():this.parentNode.removeChild(this)}),this},Object.prototype.toArray=function(){return[].slice.call(this)},Object.prototype.html=function(a){return"undefined"==typeof a?this:(this.forEach(function(){this.html(a)}),this)},Object.prototype.fade=function(a,b){var c=[];return"function"!=typeof a||b||(b=a,a=void 0),this.forEach(function(){var b=this,d="undefined"==typeof a?!b.isVisible():a,e=b.style.opacity;c.push(new Promise(function(a){d&&(b.toggle(!0),e=0);var c=setInterval(function(){d?e>=(d||1)?(clearInterval(c),a(b)):b.style.opacity=(e+=.05).toFixed(2):0>=e?(clearInterval(c),b.toggle(!1),a(b)):b.style.opacity=(e-=.05).toFixed(2)},10)}))}),Promise.all(c).then(b),this},Object.prototype.toggle=function(a,b){return this.forEach(function(){this.toggle(a,b)}),this},Object.prototype.setAttributes=function(a){return this.forEach(function(){this.setAttributes(a)}),this},Object.prototype.removeAttributes=function(a){return"string"==typeof attrs&&(a=[a]),this.forEach(function(){this.removeAttributes(a)}),this},Object.prototype.one=function(){var a,b=this&&this!==window?this:document,c=arguments[0],d=c.substr(0,1),e=c.substr(1,c.length);if(!d||!e)return null;if(e.multiSelect())a=b.querySelector(c);else switch(d){case"#":a=document.getElementById(e);break;case"@":a=b.getElementsByName(e)[0];break;case".":a=b.getElementsByClassName(e)[0];break;default:a=b.getElementsByTagName(c)[0]}return a},Object.prototype.all=function(){var a,b=this&&this!==window?this:document,c=arguments[0],d=c.substr(0,1),e=c.substr(1,c.length);if(!d||!e)return[];if(e.multiSelect())a=b.querySelectorAll(c);else switch(d){case"#":a=[document.getElementById(e)];break;case"@":a=b.getElementsByName(e);break;case".":a=b.getElementsByClassName(e);break;default:a=b.getElementsByTagName(c)}return a},Object.prototype.css=function(a){return this.forEach(function(){this.css(this)}),this},String.prototype.fd=function(){var a=this.substr(0,10).split("-");return 3===a.length&&(a=(1===a[2].length?"0":"")+a[2]+"/"+(1===a[1].length?"0":"")+a[1]+"/"+a[0]),a},String.prototype.multiSelect=function(){return-1!==this.indexOf(" ")||-1!==this.indexOf(",")||-1!==this.indexOf(".")||-1!==this.indexOf("#")||-1!==this.indexOf(":")||-1!==this.indexOf("]")},String.prototype.ns=function(){return this.replace(/^\s+/g,"").replace(/\s+$/g,"")},Array.prototype.ns=function(){for(var a=0,b=this.length;b>a;a++)"string"==typeof this[a]&&(this[a]=this[a].ns());return this},window.FileReader&&window.Promise&&"formNoValidate"in document.createElement("input")){var µ=document;µ.setEvents("DOMContentLoaded",function(){"use strict";var a=(new Date,io({reconnection:!0})),b=new ColorThief,c=function(){return{top:window.scrollY||µ.documentElement.scrollTop,left:window.scrollX||µ.documentElement.scrollLeft}},d={init:function(a){if(!a.id)return n();for(var b in a)this[b]=a[b];this.picture&&this.link&&one("#picture").toggle(!0).newElement("img",{src:this.picture,title:"Google+"}).setEvents("click",function(){window.open(d.link)}),this.googleSignIn&&all(".gSignIn").toggleClass("notdisplayed"),this.first&&one("#profileWindow").trigger("click"),l.init()},"delete":function(){return one("#errPwd").toggle(!1),one("@pwd").reportValidity()?(p.confirm("warning",one("#delete").getAttribute("confirm")).then(function(){a.emit("deleteUser",one("@pwd").value)}),!1):void 0},update:function(){return one("#errPwd").fade(!1),a.emit("updateUser",this.serialize()),!1},updated:function(a){d.name=a.name,d.googleSync=a.googleSync,p.close()},nokdated:function(){return one("#errPwd").toggle(!0),!1},book:function(a){return _.find(this.books,_.matchesProperty("id",a))},bookindex:function(a){return _.findIndex(this.books,_.matchesProperty("id",a))},addbook:function(a){-1===d.bookindex(a.id)&&(d.books.push(a),d.books=_.sortBy(d.books,"title"));var b=h.one(a.id);b&&(b.b=a),one("#nbBooks").html(d.books.length)},removebook:function(a){return _.remove(this.books,_.matchesProperty("id",a)),this.books.length},updatebook:function(a){var b=d.bookindex(a.id);a.update&&(a=_.assign(a,a.update)),delete a.update,-1!==b&&(this.books[b]=_.assign(this.books[b],a));var c=h.one(a.id);c&&c.col&&(a.title||a.authors||a.alternative)&&(a.title&&c.c.one("header").html(a.title),a.authors&&c.c.one("figcaption").html(a.authors.join(", ")),a.alternative&&(c.c.one(".cover").src=a.alternative))},updatetags:function(){this.tags=_.countBy(_.flatten(_.compact(_.pluck(this.books,"tags")),!0).sort()),j.init()},destroy:function(){for(var a in this)_.isFunction(this[a])||delete this[a]},collection:function(){return p.close(),one("@filtre").value=one("#selectedTag").innerHTML="",one("@filtre").setAttribute("data-prec",""),one("#tags").toggle(!_.isEmpty(d.tags)),all(".bookcell").toggleClass("tofilter tohide",!1),one("#nbBooks").html(d.books.length),one("#collection").hasClass("active")?(h.display(),m.endRequest(d.books.length)):(f.active.call(one("#collection")),h.show(d.books,!0)),!1}},e={nbcols:~~(window.innerWidth/256),get:function(){var a,b=one("#d");if(b||(b=µ.body.newElement("section",{id:"d",role:"main"}),b.newElement("section",{"class":"notdisplayed"})),a=(b.clientWidth/e.nbcols).toFixed(0),b.all(".col").length!==e.nbcols){b.all(".col").removeAll();for(var c=0;c<e.nbcols;c++)b.newElement("div",{"class":"col",colid:c}).css({width:a,"max-width":a});b.css({"padding-top":one("#nvb").isVisible()?one("#nvb").clientHeight:0}),all(".col").setEvents({dragenter:function(a){a.preventDefault()},dragover:function(a){a.preventDefault()},drop:function(a){a.preventDefault();var b=h.one(JSON.parse(a.dataTransfer.getData("cell"))).cell,c=a.target.closest("bookcell");return c?b!==c&&(c.closest("col").insertBefore(b,c),h.loadcovers(),one(".sortBy")&&f.blur.call(one(".sortBy").toggleClass("sortBy",!1))):this.appendChild(b),!1}})}return b},remove:function(){one("#d")&&one("#d").removeAll()},resize:function(){e.nbcols!==~~(window.innerWidth/256)?(one("#detailWindow").isVisible()&&one("#detailWindow").css({height:~~(.95*window.innerHeight),"max-height":~~(.95*window.innerHeight)}),j.destroy(),all(".deroulant").fade(!1),e.nbcols=~~(window.innerWidth/256),e.remove(),h.display()):all(".col").css({width:~~(window.innerWidth/e.nbcols),"max-width":~~(window.innerWidth/e.nbcols)})}},f={hover:function(){var a="img"===this.tagName.toLowerCase()?this:this.one("img");return this.hasClass("active")||this.hasClass("sortBy")?!1:void(a&&(a.src=images[a.getAttribute("source")][a.getAttribute("hover")]))},blur:function(){var a="img"===this.tagName.toLowerCase()?this:this.one("img");return this.hasClass("active")||this.hasClass("sortBy")?!1:void(a&&(a.src=images[a.getAttribute("source")][a.getAttribute("blur")],a.isVisible()||a.hasClass("nsv")||a.css({visibility:"visible"})))},active:function(){var a=all(".active").toArray();all(".active").toggleClass("active",!1),a.forEach(function(a){f.blur.call(a)}),this.toggleClass("active",!0),one("#tags").toggle("collection"===this.id&&!_.isEmpty(d.tags)),this.all("img").forEach(function(){this.src=images[this.getAttribute("source")][this.getAttribute("active")]})}},g={show:function(){f.hover.call(one("#sort img")),all("#tags, #notifications").toggle(!1)},toggle:function(){all(".nvb").fade(function(){one("#d").css({"padding-top":one("#nvb").isVisible()?one("#nvb").clientHeight:0})})},notif:function(a){a&&one("#sort").fade(!1),one("#notifs").css({top:one("#nvb").clientHeight+5,left:one("#notifications").offsetLeft}),one("#notifs").fade(.95)},sort:function(a){var b=one("#sort");a&&one("#notifs").fade(!1),b.isVisible()?b.fade(!1):b.css({top:one("#nvb").clientHeight+5,left:one("#tris").offsetLeft}).fade(.95)},link:function(){window.open(this.getAttribute("url"))},mail:function(){µ.location.href="mailto:"+this.getAttribute("mail")},context:function(a){a.preventDefault();var b=one("#contextMenu");return!one("#detailWindow").isVisible()||one("#w").hasClass("over")||_.isEmpty(q.data.book)||b.fade(!0).css({top:a.clientY+b.clientHeight>window.innerHeight?a.clientY-b.clientHeight:a.clientY,left:a.clientX+b.clientWidth>window.innerWidth?a.clientX-b.clientWidth:a.clientX}),!1},close:function(a){var b=a.target.closest("action");one("#contextMenu").isVisible()&&!a.target.getAttribute("nav")&&one("#contextMenu").fade(!1),b&&_.includes(["notifications","tris"],b.getAttribute("id"))||all(".deroulant").fade(!1)},nav:function(){if(!q.data.c)return!1;var a=q.data.c,b=a.parentNode.all(".bookcell"),c=a.index(),d=parseInt(a.parentNode.getAttribute("colid"),10);switch(this.getAttribute("nav")){case"top":if(!c)return!1;c--;break;case"right":d++,d===e.nbcols&&(d=0,c++);break;case"left":if(!c&&!d)return!1;d||(d=e.nbcols,c--),d--;break;case"bottom":if(c>=b.length)return!1;c++}return one("[colid='"+d+"']").childNodes[c].one(".cover").trigger("click"),!1},selectstart:function(a){return a.preventDefault(),a.target.tagName&&!_.includes(["input","textarea"],a.target.tagName.toLowerCase())?!1:void 0},top:function(){var a=setInterval(function(){var b=(c().top/2).toFixed(1);window.scroll(0,b),.1>=b&&(window.scroll(0,0),clearInterval(a))},100)}},h={books:[],cells:[],add:function(a){h.cells=_.union(h.cells,_.isArray(a)?a:[a])},destroy:function(){e.remove(),h.books=[],h.cells=[]},one:function(a){return _.find(h.cells,_.matchesProperty("id",a))},show:function(a,b){b&&h.destroy();var c=[];m.last&&(h.books.push(a),h.books=_.flattenDeep(h.books));for(var e=0,f=a.length;f>e;e++)h.one(a[e].id)||c.push(new i(d.book(a[e].id)||a[e]));h.add(c),h.display(c,!0),r.toggle()},returned:function(a){h.one(a.id).returned(a)},display:function(a,b){if(!a&&one(".sortBy"))return h.sort.call(one(".sortBy"));a=a||_.sortBy(h.cells,function(a){return[a.row,a.col]});var c=e.get(),d=b?all(".bookcell [colid]").length:0,f=0;a.forEach(function(a,b){var g=a.cell;a.col=(d+b)%e.nbcols,a.row=Math.floor((d+b)/e.nbcols),g.hasClass("tohide")||g.hasClass("tofilter")?c.one("section.notdisplayed").appendChild(g):(g.css({visibility:"hidden"}).toggleClass("toshow",!0),one("[colid='"+f%e.nbcols+"']").appendChild(g),f++),g.all("header, figure *:not(button)").setEvents("click",a.detail),g.all("button").setEvents("click",a.action),g.setEvents("mouseenter mouseleave",a.description)}),h.loadcovers()},loadcovers:function(){for(var a=0,b=h.cells.length;b>a;a++)h.cells[a].loadcover();one("#footer").toggle(!!c().top)},bytags:function(a){one("#formFilter").reset(),all(".bookcell").toggleClass("tofilter",!1),one("#selectedTag").html(a),h.cells.forEach(function(b){b.cell.toggleClass("tohide",!_.includes(b.book.tags,a))}),h.display()},sort:function(){one(".sortBy")&&this!==one(".sortBy")&&(f.blur.call(one(".sortBy").toggleClass("sortBy",!1)),f.hover.call(this.toggleClass("sortBy",!0)));var a=this.getAttribute("by"),b=this.getAttribute("sort"),c=_.sortBy(h.cells,function(b){return b.book[a]||null});b&&c.reverse(),h.display(c)},filter:function(){var a=this.value.toLowerCase();this.checkValidity()&&a!==this.getAttribute("data-prec")&&(this.setAttribute("data-prec",a),h.cells.forEach(function(b){var c=b.b.title.toLowerCase(),d=b.b.subtitle?b.b.subtitle.toLowerCase():"",e=b.b.authors?b.b.authors.join(", ").toLowerCase():"",f=b.b.description.toLowerCase();b.c.toggleClass("tofilter",-1===c.indexOf(a)&&-1===d.indexOf(a)&&-1===e.indexOf(a)&&-1===f.indexOf(a))}),h.display())}},i=function(b){var e=this,f=one("#tempCell").cloneNode(!0).removeAttributes("id").toggleClass("bookcell",!0),g=function(){var c=this.classList;f.all("button").fade(),_.includes(c,"add")&&a.emit("addBook",b.id),_.includes(c,"remove")&&(one("#collection").hasClass("active")&&f.fade(function(){f.removeAll(),h.loadcovers()}),a.emit("removeBook",b.id),one("#nbBooks").html(d.removebook(b.id)))},i=function(a){e.book=a,e.opened=!0,q.data=e,q.show(),l.setDetail(a)},j=function(a){if(a.relatedTarget&&!a.relatedTarget.hasClass("description")&&all(".description").removeAll(),"mouseenter"===a.type){if(!b.description)return!1;var c=b.description.indexOf(" ",500),d=function(){this.removeAll()},e={"max-height":window.innerHeight,left:Math.min(this.offsetLeft+this.clientWidth/3,window.innerWidth-1.333*this.clientWidth).toFixed(0)},f=(this.offsetTop+this.clientHeight/3).toFixed(0),g=µ.body.newElement("div",{width:this.clientWidth,bookid:b.id,"class":"description notdisplayed"}).css({width:this.clientWidth}).setEvents("click",d).html("<span>"+b.title+"</span><BR>"+b.description.substr(0,Math.max(c,500))+(-1!==c?"...":""));f+g.clientHeight>µ.clientHeight?e.bottom=.333*this.clientHeight:e.top=f,g.css(e),setTimeout(function(){g.fade(.9).setEvents("mouseleave",d)},1e3)}},k=function(){return-1!==d.bookindex(b.id)||e.opened?(q.data=e,q.show(-1!==d.bookindex(b.id))):l.getDetail(b.id).then(function(c){c?(q.data.book=c,q.show(!1)):(r.toggle(1,1),a.emit("searchDetail",b.id))}),!1},m=function(){if(f.hasClass("toshow")){var a=f.one(".cover");a&&window.innerHeight+c().top>f.offsetTop&&(f.toggleClass("toshow",!1).css({visibility:"visible"}),f.setEvents({dragstart:n,dragend:o}),f.one("footer").css({bottom:f.one("figcaption").clientHeight+5}),(b.alternative||b.base64)&&(a.src=b.alternative||b.base64))}},n=function(a){this.toggleClass("isDrag",!0),a.dataTransfer.effectAllowed="move",a.dataTransfer.dropEffect="move",a.dataTransfer.setData("cell",JSON.stringify(e.id))},o=function(){this.toggleClass("isDrag",!1)};return this.id=b.id,this.action=g,this.book=b,this.cell=f,this.loadcover=m,this.opened=!1,this.returned=i,this.detail=k,this.description=j,f.one("header").html(b.title),f.one("figcaption").html(b.authors?b.authors.join(", "):""),f.one(".previewable").toggle(!!b.access&&"NONE"!==b.access),f.one(".personnal").toggle(_.isEqual(b.id.user,d.id)),f.one(".recommanded").toggle(!!b.from),f.one(".add").toggle(-1===d.bookindex(b.id)),f.one(".remove").toggle(-1!==d.bookindex(b.id)),this},j={init:function(){j.cloud=[],all("#cloud span").removeAll();if(d.tags){var a="";_.forEach(d.tags,function(b,c){j.cloud.push({text:c,weight:b}),a+="<option>"+c+"</option>"}),one("#tagsList").html(a),j.cloud=_.sortBy(j.cloud,"weight").reverse()}},generate:function(){var a=one("#cloud"),b=function(){j.show(),h.bytags(this.innerHTML),r.toggle(!1)},c=~~(a.clientHeight/2),d=~~(a.clientWidth/2),e=d/c,f=3,g=[],i=function(a,b){for(var c=function(a,b){return Math.abs(2*a.offsetLeft+a.offsetWidth-2*b.offsetLeft-b.offsetWidth)<a.offsetWidth+b.offsetWidth&&Math.abs(2*a.offsetTop+a.offsetHeight-2*b.offsetTop-b.offsetHeight)<a.offsetHeight+b.offsetHeight},d=0,e=b.length;e>d;d++)if(c(a,b[d]))return!0;return!1};_.forEach(j.cloud,function(b,h){var j=a.newElement("span",{title:b.weight,"class":"tag tag"+Math.min(~~(b.weight/5)+1,10)}).html(b.text),k=c-j.clientHeight/2,l=d-j.clientWidth/2,m=0,n=6.28*Math.random();for(j.css({top:k,left:l});i(j,g);)m+=f,n+=(h%2===0?1:-1)*f,k=c+m*Math.sin(n)-j.clientHeight/2,l=d-j.clientWidth/2+m*Math.cos(n)*e,j.css({top:k,left:l});g.push(j)}),a.all("span").setEvents("click",b)},show:function(){return one("#wa").isVisible()||!one("#collection").hasClass("active")?!1:void p.close(function(){var a=one("#cloud"),b=a.isVisible();all("html").toggleClass("overflown",!b),b?a.fade(!1):a.fade(.8,function(b){return a.all("span").length?!1:void j.generate()})})},close:function(){one("#cloud").isVisible()&&j.show()},destroy:function(){j.close(),all("#cloud span").removeAll()},add:function(a){a.preventDefault();var b=this.formToJson().tag.toLowerCase(),c=all("#userTags > div").toArray(),d=_.find(c,function(a){return a.one(".libelle").html()===b});return d||(c.push(j["new"](b,!0)),c=_.sortBy(c,function(a){return a.one(".libelle").html()}),c.forEach(function(a){one("#userTags").appendChild(a)})),this.reset(),!1},"new":function(a,b){var c=one("#tempTag").cloneNode(!0);return c.removeAttribute("id"),c.setEvent("click",function(a){a.target.hasClass("libelle")?(p.close(),h.bytags(a.target.html())):this.fade(!1,function(){c.removeAll(),one("#detailWindow [autofocus]").focus()})}),c.one(".libelle").html(a).toggleClass("new",!!b),c},list:function(){one("[name=tag]").setAttributes({list:this.value?"tagsList":"none"})}},k={show:function(a){a&&(k.list=a),all("#notifications, #notifNumber").toggle(!!k.list.length),one("#notifNumber").html(k.list.length);for(var b=0,c=k.list.length;c>b;b++){var d=one("#tempNotif").cloneNode(!0);d.setAttributes({notif:JSON.stringify(N.list[b])}).removeAttribute("id"),one("#notifName").html(k.list[b].from),one("#notifTitle").html(k.list[b].title),d.setEvents("click",k.click),one("#notifs").appendChild(d)}},click:function(){var b=this,c=JSON.parse(b.getAttribute("notif"));c._id.book;_.remove(k.list,c),k.last=c,one("#notifs").toggle(function(){b.removeAll()}),all("#notifications, #notifNumber").toggle(!!k.list.length),one("#notifNumber").html(k.list.length),r.toggle(1,1),a.emit("readNotif",c)}},l={init:function(){return l.indexedDB=window.indexedDB||window.mozIndexedDB||window.webkitIndexedDB||window.msIndexedDB,new Promise(function(a,b){if(l.indexedDB){var c=indexedDB.open(d.session,1);c.onerror=function(){b()},c.onsuccess=function(){l.db=this.result,a()},c.onupgradeneeded=function(){var a=this.result;a.createObjectStore("queries",{keyPath:"query"}).createIndex("by_query","query",{unique:!0}),a.createObjectStore("details",{keyPath:"id"}).createIndex("by_id","id",{unique:!0})}}})},getQuery:function(a){return new Promise(function(b,c){l.db||c();var d=l.db.transaction(["queries"],"readwrite").objectStore("queries").index("by_query").get(JSON.stringify(a));d.onsuccess=function(){this.result&&this.result.books.length?b(this.result.books):c()},d.onerror=c})},setQuery:function(a,b){if(l.db){l.db.transaction(["queries"],"readwrite").objectStore("queries").put({query:JSON.stringify(a),books:b})}},deleteQuery:function(a){l.db&&l.db.transaction(["queries"],"readwrite").objectStore("queries")["delete"](a)},getDetail:function(a){return new Promise(function(b,c){l.db||c();var d=l.db.transaction(["details"],"readwrite").objectStore("details").index("by_id").get(a);d.onsuccess=function(){this.result?b(this.result):b()},d.onerror=function(){b()}})},setDetail:function(a){if(l.db){l.db.transaction(["details"],"readwrite").objectStore("details").put(a)}},deleteDetail:function(a){l.db&&l.db.transaction(["details"],"readwrite").objectStore("details")["delete"](a)}},m={books:function(b){b.preventDefault(),m.clear();var c=this.formToJson();return m.last={q:c.searchby+c.searchinput,langRestrict:c.langage},one("@filtre").setAttributes("data-prec","").value="",p.close(function(){r.toggle(1,1).then(function(){l.getQuery(m.last).then(h.show,function(){one("#nvb").toggleClass("inactive",!0),r.anim(!0),a.emit("searchBooks",m.last)})})}),!1},recommand:function(){m.clear(),m.last={recommand:d.id},p.close(function(){r.toggle(1,1),l.getQuery(m.last).then(h.show)["catch"](function(){one("#nvb").toggleClass("inactive",!0),r.anim(!0),a.emit("recommanded")})})},associated:function(b){m.clear(),m.last={associated:b},p.close(function(){r.toggle(1,1),l.getQuery(m.last).then(h.show,function(){one("#nvb").toggleClass("inactive",!0),r.anim(!0),a.emit("associated",b)})})},gtrans:function(){var b=this.id;p.confirm("warning","Cette opération va importer/exporter vos EBooks depuis/vers votre bibliothèque Google.<BR>Etes vous sur de vouloir continuer?").then(function(){return"exportNow"===b?a.emit("exportNow"):(h.destroy(),f.active.call(one("#collection")),one("#nvb").toggleClass("inactive",!0),r.anim(!0),void p.close(function(){r.toggle(1,1),a.emit("importNow")}))})},clear:function(){h.destroy(),e.remove(),f.active.call(one("#recherche")),one("#selectedTag").html("")},endRequest:function(a){one("#nvb").toggleClass("inactive",!1),r.anim(!1),a||r.toggle(),m.last&&l.setQuery(m.last,h.books)}},n=function(){return d.destroy(),h.destroy(),a.close(),l.indexedDB&&l.indexedDB.deleteDatabase(d.id),window.location.assign("/logout")},o=function(){var a;switch(this.setCustomValidity(""),this.name){case"searchinput":a=this.value.length<3;break;case"filtre":a=!!this.value.length&&this.value.length<3;break;case"name":a=this.value.length<4;break;case"pwd":a=this.value.length<4||this.value.length>12;break;case"newPwd":a=this.value.length<4||this.value.length>12;break;case"confirmPwd":a=this.value!==one("[name=newPwd]").value;break;case"recommand":a=this.value.toLowerCase()===d.id;break;case"title":a=this.value.length<6}a&&this.setCustomValidity(this.getAttribute("error"))},p={open:function(){var a=this;return new Promise(function(b,e){var f="string"==typeof a?a:a.getAttribute("window"),g=one("#"+f);j.close(),one("#wa").isVisible()&&b(),_.includes(["previewWindow","recommandWindow"],f)||all(".window:not(.notdisplayed)").fade(!1),"profileWindow"===f&&(one("@mail").value=d.id,one("@name").value=d.name,d.googleSignIn?(one("@googleSignIn").setAttribute("checked",!0),d.googleSync&&one("@googleSync").setAttribute("checked",!0)):one("@pwd").setAttribute("required",!0),all(".changePwd input[required=true]").length&&p.togglePwd()),r.toggle(1).then(function(){p.on=!0,g.css({top:c().top+10}).fade(!0),g.one("[autofocus]")&&g.one("[autofocus]").focus(),b()}),all(".errMsg").toggle(!1)})},close:function(a){var b=all(".window:not(.notdisplayed)");return!b.length&&_.isFunction(a)?a.call():(r.over(!1),µ.removeEventListener("keyup",s),all("[note]").forEach(f.blur),b.forEach(function(){this.fade(!1,function(){_.isFunction(a)?a.call():r.toggle()})}),_.forEach(all("form"),function(a){a.reset()}),void delete p.on)},confirm:function(a,b){return new Promise(function(d,e){r.over(),one("#confirmWindow header span").html(one("#confirmWindow header span").getAttribute(a)),one("#confirmWindow #confirm").html(b),all("#confirmWindow button").setEvents("click",p.close),one("#confirmWindow .valid").setEvents("click",function(){d()}),one("#confirmWindow .cancel").toggle("warning"===a).setEvents("click",function(){e()}),r.toggle(1).then(function(){one("#confirmWindow").css({top:c().top+10,left:"25%"}).fade(!0),µ.setEvents({"keyup keydown":Window.esc})})})},esc:function(a){27===a.keyCode&&p.close()},togglePwd:function(){all(".changePwd").fade(function(a){a.forEach(function(a){a.all("[type=password]").setAttributes({required:a.isVisible()})})})}},q={data:{},action:function(){var b,c=q.data.book.id,e=d.bookindex(c),f=this.getAttribute("actclick");-1!==e&&(b=d.books[e]),this.add=function(){if(c)a.emit("addDetail"),q.newCell();else{var b,d=one("#formNew").formToJson();all("#formNew input, #formNew textarea").forEach(function(){this.reportValidity()||(b=!0)}),d.authors=d.authors?d.authors.split(","):[];for(var e=0,f=d.authors.length;f>e;e++)d.authors[e]=d.authors[e].ns();if(b)return!1;r.over(),a.emit("newbook",d)}},this.associated=function(){m.associated(c)},this.update=function(){var e=!1,f={id:c},g=_.map(all("#userTags > div").toArray(),function(a){return a.one(".libelle").html()}),h=one("#userNote").value,i=one("#userComment").value,j=one("#detailCover").getAttribute("maincolor"),k=one("#detailCover").getAttribute("src");if(_.isObject(c)&&c.user===d.id){var l=one("#formNew").formToJson();l.authors=l.authors.split(",")||[],_.forEach(l,function(a,c){_.isEqual(b[c],a)||(e=!0,f.update||(f.update={}),f.update[c]=a.ns())})}h&&h!==b.userNote&&(e=!0,f.userNote=h),i&&i!==b.userComment&&(e=!0,f.userComment=i),(!b.tags.length&&g.length||!_.isEqual(g,b.tags))&&(e="tags",f.tags=g),j&&b.alternative!==k&&(e=!0,f.alternative=k,f.maincolor=j),e&&(f.userDate=(new Date).toJSON(),a.emit("updateBook",f),d.updatebook(f),d.updatetags(),one("#tags").toggle(!_.isEmpty(d.tags)&&one("#collection").hasClass("active"))),p.close()},this.upload=function(){one("#uploadHidden [type=file]").trigger("click")},this.preview=function(){one("[name=previewid]").value=c,r.over(),p.open.call("previewWindow").then(function(a){one("#preview").submit()})},this.google=function(){window.open(this.getAttribute("link"))},this.recommand=function(){r.over(),p.open.call("recommandWindow")},this.close=function(){this.closest("window").fade(!1,function(){r.over(!1)})},this[f].call(this)},newCell:function(){all("[actclick=add], [actclick=update], #upload, .inCollection").toggle();var a=h.one(q.data.book.id);if(one("#collection").hasClass("active")&&!a){var b=d.books.length%e.nbcols,c=all("[colid="+d.books.length%e.nbcols+"] .bookcell").length;a=_.extend({col:b,row:c},new B(q.data.book)),h.add(a),h.display()}a&&a.c&&a.cell.all("button").fade(),d.addbook(q.data.book)},userNote:function(){for(var a=all("[note]").toArray(),b=one("#userNote").value,c=0;c<a.length;c++)b>c?a[c].src=images[a[c].getAttribute("select")].black:a[c].src=images[a[c].getAttribute("source")].black},mouseNote:function(){var a=one("#userNote").value||0,b=this.getAttribute("note"),c=all("[note]").toArray();if(a!==b)for(var d=0;d<Math.max(a,b);d++)d<Math.min(a,b)?c[d].src=images[c[d].getAttribute("select")].black:a>b?c[d].src=images[c[d].getAttribute("hoverminus")].black:c[d].src=images[c[d].getAttribute("hoverplus")].black},clickNote:function(){var a=one("#userNote"),b=this.getAttribute("note");a.value===b&&"1"===a.value?a.value=0:a.value=b,q.userNote()},links:function(){var a=this.getAttribute("searchby"),b=this.html();a&&b&&(one("#formSearch [type=search]","").value=b,all("#formSearch [name=searchby]")[a].checked=!0,one("#formSearch").trigger("submit"))},mainColor:function(a){var c=b.getColor(a),d="#"+((1<<24)+(c[0]<<16)+(c[1]<<8)+c[2]).toString(16).substr(1);return{rgb:c,hex:d}},uploadCover:function(){var a=this.files;if(a[0]){if(!a[0].type.match(/image.*/)||a[0].size>5e5)return p.confirm("error","Veuillez sélectionner un fichier de type 'image' inférieure à 500KB."),!1;var b=new FileReader;b.onload=function(a){return function(b){a.onload=function(){var a=q.mainColor(this);this.toggleClass("new",!0).setAttribute("maincolor",a.hex),one("#detailContent").css("background","radial-gradient(whitesmoke 40%, "+a.hex+")")},a.src=b.target.result}}(one("#detailCover")),b.readAsDataURL(this.files[0])}},sendNotif:function(b){b.preventDefault();var c=this.formToJson();return c.book=q.data.book.id,c.title=q.data.book.title,q.data.book.alt&&(c.alt=q.data.book.alt),a.emit("sendNotif",c),one("#recommandWindow img").trigger("click"),!1},modify:function(){if(this.hasClass("modify")){this.hasClass("hide")&&this.siblings("[name]").forEach(function(){this.value=this.getAttribute("oldvalue")}),this.toggleClass("hide"),this.siblings("[field]:not(.noValue), [name]").toggle(null);var a=this.siblings("[name]")[0];a.focus(),"textarea"===a.tagName.toLowerCase()&&(a.scrollTop=0)}},"new":function(){q.data.book={},q.show(!1),one("#formNew").reset(),all("#formNew input, #formNew textarea, .volumeInfo:not(.nonEditable), .volumeInfo:not(.nonEditable) button").toggle(!0),all("#formNew [field]").toggle(!1)},show:function(a){var b=q.data.book,c=one("#detailWindow");c.all("#formNew input, #formNew textarea").toggle(!1),c.all("#formNew button:not(.categories)").toggleClass("hide",!1).toggleClass("modify",!!b.id&&_.isEqual(b.id.user,d.id)),c.one("#detailWindow [type=file]").value="",one("#comments").children.removeAll(),c.css({background:"whitesmoke","max-height":~~(.95*window.innerHeight)}),one("#userNote").value=b.note,c.all("#detailWindow .new").toggleClass("new",!1),c.all(".inCollection").toggle(!!a),j.list(),b.mainColor?c.css({background:"radial-gradient(whitesmoke 40%, "+b.mainColor+")"}):one("#detailCover").onload=function(){(b.alternative||b.base64)&&(b.mainColor=q.mainColor(this).hex,c.css({background:"radial-gradient(whitesmoke 40%, "+b.mainColor+")"}))},one("#detailCover").src=b.alternative||b.base64||images["book-4-icon"].black,c.all(".direct").html(""),c.all("#userTags > div").removeAll(),c.one("#detailWindow .windowheader span").html(b.title||one("#detailWindow .windowheader span").getAttribute("label")),all("[actclick=add]").toggle(!a),all("[actclick=update]").toggle(!!a),all("[actclick=recommand]").toggle(!!a),all("[actclick=associated]").toggle(!!b.id&&!_.isObject(b.id)),all("[actclick=preview]").toggle(!!b.access&&"NONE"!==b.access),all("[actclick=google]").setAttributes({link:b.link}).toggle(!!b.link),all("[actclick=upload]").toggle(!b.base64&&!b.cover&&!!a),c.all(".comments").toggle(!!b.comments&&!!b.comments.length),c.all("#detailWindow [field]").toggleClass("noValue",!1),c.all("[field=authors] span").removeAll(),c.all(".volumeInfo").toggle(!1),q.userNote(),c.hasClass("notdisplayed")&&p.open.call("detailWindow"),_.forEach(b,function(a,e){var f=c.one("[field="+e+"]"),g=c.one("[name="+e+"]");switch(f&&"subtitle"!==e&&(f.closest("volumeInfo").toggle(!!a||_.isEqual(b.id.user,d.id)),f.toggle(!!a).toggleClass("noValue",!a)),e){case"authors":a.forEach(function(a){f.newElement("span",{"class":"link",searchby:3}).html(a)}),g.value=a.join(", "),g.setAttribute("oldvalue",a.join(", ")),f.parentNode.all("button").toggle(!!a.length);break;case"tags":var h=one("#userTags");a.forEach(function(a){h.appendChild(j["new"](a))});break;case"userNote":q.clickNote.call(one("[note='"+a+"']"));break;case"userComment":one("#userComment").value=a;break;case"comments":var i,k=0;a.length||c.one(".comments").toggle(!1),
a.forEach(function(a){if(a.comment){var b=one("#tempComment").cloneNode(!0);b.removeAttribute("id"),b.one(".commentAuthor").html(a.name),b.one(".commentDate").html(a.date.fd()),b.one(".commentNote").html(a.note),b.one(".commentComment").html(a.comment),one("#comments").appendChild(b)}a.note&&(i=(i||0)+parseInt(a.note,10),k++)}),"undefined"!=typeof i&&k&&(i=(i/k).toFixed(2),one(".subtitle").toggle(!0),one("#mNote").html(i));break;default:if(!f)break;_.isArray(a)&&(a=a.join(", ")),g&&(g.setAttribute("oldvalue",a),g.value=a,g.scrollTop=0),"time"===f.tagName.toLowerCase()&&(f.setAttribute("datetime",new Date(a)),a=a.fd()),f.html(a)}}),all(".link").setEvents("click",q.links,!1)}},r={toggle:function(a,b){return r.p=new Promise(function(c){var d=one("#w");d.one("img").toggle(!!b),p.on||r.on||a===d.isVisible()?c():(r.on=!0,all(".description").removeAll(),a?(all("html").toggleClass("overflown",!0),d.fade(.5,c)):d.fade(!1,function(){all("html").toggleClass("overflown",!1),r.over(!1),c()}))}),r.p.then(function(){delete r.on}),r.p},anim:function(a){one("#wa").fade(a)},over:function(a){one("#w").toggleClass("over",a)}},s=function(a){if(a=a||window.event,!a.altKey)if(a.ctrlKey){var b;switch(a.keyCode){case 77:g.toggle(),b=!0;break;case 76:n(),b=!0;break;case 82:one("#recherche").trigger("click"),b=!0;break;case 80:one("#profil").trigger("click"),b=!0;break;case 66:one("#collection").trigger("click"),b=!0;break;case 69:one("#tags").trigger("click"),b=!0;break;case 73:one("#contact").trigger("click"),b=!0}if(b)return!1}else 27===a.keyCode&&(p.close(),j.close(),one("#contextMenu").fade(!1))};a.on("reconnect",function(){a.io.reconnect()}).on("connect",function(){a.emit("isConnected")}).on("disconnect",function(){d.destroy(),p.close(),r.toggle(1,1),all(".deroulant").toggle(!1),h.destroy()}).on("error",function(a){}).on("user",function(a){g.show(),d.init(a)}).on("collection",function(a){d.books=a.books,k.show(a.notifs),j.init(),one("#collection").trigger("click")}).on("books",h.show).on("endRequest",m.endRequest).on("returnAdd",d.addbook).on("returnDetail",h.returned).on("logout",n).on("updateOk",d.updated).on("updateNok",d.nokdated).on("error",function(a){}).on("returnNotif",function(a){q.bookid=a.id,q.data={book:a},q.show(-1!==d.bookindex(a.id))}).on("newbook",function(a){q.bookid=a.id,q.data={book:a},q.newCell(),q.show(!0),r.over(!1)}).on("covers",function(a){for(var b=0,c=a.length;c>b;b++){var e=a[b],f=d.books[e.index],g=h.cells[e.index].cell;f.base64=e.base64,g.hasClass("toshow")||(g.one(".cover").src=e.base64),q.data.book&&q.data.book.id===f.id&&(one("#detailCover").src=e.base64)}}),µ.setEvents({"keyup keydown":s,scroll:h.loadcovers}),all("input").setEvents("input propertychange",o),one("#logout").setEvent("click",n),one("#formSearch").setEvent("submit",m.books),one("#formProfil").setEvent("submit",d.update),one("#formRecommand").setEvent("submit",q.sendNotif),one("#formTag").setEvent("submit",j.add),one("#formNew").setEvent("submit",function(a){a.preventDefault()}),one("#formFilter").setEvent("submit",function(a){a.preventDefault()}),all("#formNew button").setEvents("click",q.modify),one("#changePwd").setEvent("click",p.togglePwd),one("#delete").setEvent("click",d["delete"]),one("#tris").setEvent("click",g.sort),one("#notifications").setEvent("click",g.notif),all("#sort > div").setEvents("click",h.sort),all("img[actclick]").setEvents({mouseenter:f.hover,mouseleave:f.blur}),all("[actclick]").setEvents("click",q.action),all(".closeWindow").setEvents("click",p.close),one("#footer").setEvent("click",g.top),all("#uploadHidden [type=file]").setEvents("change",q.uploadCover),all("#userNote > img").setEvents({mouseenter:q.mouseNote,mouseleave:q.userNote,click:q.clickNote}),all(".nvb > div:not(#picture):not(.filtre), img.closeWindow, #footer, [by], .imgAction img, #cloud img, #contactsWindow img, [nav]").setEvents({mouseenter:f.hover,mouseleave:f.blur}),all("[blur]").forEach(f.blur),all("img").setAttributes({draggable:!1}),one("#nvb").toggleClass("notdisplayed",!1),one("#collection").setEvent("click",d.collection),all("#tags, #cloud > img").setEvents("click",j.show),all("#recherche, #profil, #contact").setEvents("click",p.open),one("#newbook").setEvent("click",q["new"]),all("@filtre").setEvents("search",h.filter),all(".tnv").setEvents("click",g.toggle),all("[url]").setEvents("click",g.link),all("[mail]").setEvents("click",g.mail),one("#recommand4u").setEvent("click",m.recommand),all("#importNow, #exportNow").setEvents("click",m.gtrans),all("@tag").setEvents("input propertychange",j.list),window.setEvents({contextmenu:g.context,resize:e.resize,click:g.close,selectstart:g.selectstart}),all("[nav]").setEvents("click",g.nav)})}else alert(document.body.getAttribute("error"));
