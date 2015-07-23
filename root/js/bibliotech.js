if(Array.prototype.noSpace=function(){for(var a=0,b=this.length;b>a;a++)"string"==typeof this[a]&&(this[a]=this[a].noSpace());return this},Element.prototype.closest=function(a){for(var b=this;b&&b.tagName&&"body"!==b.tagName.toLowerCase();){if(b.hasClass(a))return b;b=b.parentNode}return null},Element.prototype.css=function(a){var b=this;return _.isPlainObject(a)&&_.forEach(a,function(a,c){_.includes(["width","max-width","height","max-height","top","left","bottom","padding-top"],c)&&-1===a.toString().indexOf("%")&&(a+="px"),b.style[c]=a}),this},Element.prototype.fade=function(a){var b=this,c="undefined"==typeof a?!b.isVisible():a,d=b.style.opacity;return new Promise(function(a){c&&(b.toggle(!0),d=0);var e=setInterval(function(){c?d>=(c||1)?(clearInterval(e),a(b)):b.style.opacity=(d+=.05).toFixed(2):0>=d?(clearInterval(e),b.toggle(!1),a(b)):b.style.opacity=(d-=.05).toFixed(2)},10)})},Element.prototype.formToJson=function(){var a={};return this.querySelectorAll("input, textarea").forEach(function(){(_.includes(["checkbox","radio"],this.type.toLowerCase())&&this.checked||!_.includes(["checkbox","radio"],this.type.toLowerCase())&&this.name)&&(a[this.name]=this.value)}),a},Element.prototype.hasClass=function(a){return this.classList.contains(a)},Element.prototype.html=function(a){return"undefined"==typeof a?this.innerHTML:(this.innerHTML=a,this)},Element.prototype.index=function(){for(var a=this.parentNode.childNodes,b=0,c=a.length;c>b;b++)if(a[b]===this)return b;return-1},Element.prototype.isVisible=function(){return this.offsetWidth>0&&this.offsetHeight>0},Element.prototype.newElement=function(a,b){var c=document.createElement(a);return _.isPlainObject(b)&&c.setAttributes(b),this.appendChild(c),c},Element.prototype.removeAttributes=function(a){var b=this;return"string"==typeof a&&(a=[a]),_.isArray(a)&&a.forEach(function(a){b.removeAttribute(a)}),this},Element.prototype.setAttributes=function(a){var b=this;return _.isPlainObject(a)&&_.forEach(a,function(a,c){b.setAttribute(c,a)}),this},Element.prototype.setEvent=function(a,b,c){var d=this;return _.isPlainObject(a)?(_.forEach(a,function(a,b){d.setEvent(b,a,c)}),d):(this.addEventListener(a,b,c),this)},Element.prototype.siblings=function(a){return this.parentNode.all(a)},Element.prototype.text=function(a){return"undefined"==typeof a?this.textContent:(this.textContent=a,this)},Element.prototype.toggle=function(a){return("undefined"==typeof a||null===a)&&(a=!this.isVisible()),this.toggleClass("notdisplayed",!a),this},Element.prototype.trigger=function(a){var b;try{b=new Event(a)}catch(c){b=document.createEvent(_.includes(["click","mouseenter","mouseleave","mouseup","mousedown"],a)?"MouseEvents":"HTMLEvents"),b.initEvent(a,!0,!0)}return this.dispatchEvent(b),this},Element.prototype.xposition=function(){return this.parentNode&&this.parentNode.tagName?this.parentNode.offsetLeft:this.offsetLeft},Object.prototype.all=function(){var a,b=this&&this!==window?this:document,c=arguments[0],d=c.substr(0,1),e=c.substr(1,c.length);if(!d||!e)return[];if(e.multiSelect())a=b.querySelectorAll(c);else switch(d){case"#":a=[document.getElementById(e)];break;case"@":a=document.getElementsByName(e);break;case".":a=b.getElementsByClassName(e);break;default:a=b.getElementsByTagName(c)}return a},Object.prototype.css=function(a){return this.forEach(function(){this.css(this)}),this},Object.prototype.fade=function(a){var b=[];return this.forEach(function(){b.push(this.fade(a))}),Promise.all(b)},Object.prototype.forEach=function(a){var b=this;return("undefined"==typeof b.length||b===window)&&(b=[b]),[].forEach.call(b,function(b){a.call(b)}),this},Object.prototype.html=function(a){return"undefined"==typeof a?this:(this.forEach(function(){this.html(a)}),this)},Object.prototype.one=function(){var a,b=this&&this!==window?this:document,c=arguments[0],d=c.substr(0,1),e=c.substr(1,c.length);if(!d||!e)return null;if(e.multiSelect())a=b.querySelector(c);else switch(d){case"#":a=document.getElementById(e);break;case"@":a=document.getElementsByName(e)[0];break;case".":a=b.getElementsByClassName(e)[0];break;default:a=b.getElementsByTagName(c)[0]}return a},Object.prototype.removeAll=function(){return this.forEach(function(){this.remove?this.remove():this.parentNode.removeChild(this)}),this},Object.prototype.removeAttributes=function(a){return"string"==typeof attrs&&(a=[a]),this.forEach(function(){this.removeAttributes(a)}),this},Object.prototype.setAttributes=function(a){return this.forEach(function(){this.setAttributes(a)}),this},Object.prototype.setEvents=function(a,b,c){var d=this;return _.isPlainObject(a)?(_.forEach(a,function(a,b){d.setEvents(b,a,c)}),d):(a=a.split(" "),d.forEach(function(){var d=this;a.forEach(function(a){d.addEventListener(a,b,c)})}),d)},Object.prototype.text=function(a){return"undefined"==typeof a?this:(this.forEach(function(){this.text(a)}),this)},Object.prototype.toArray=function(){return[].slice.call(this)},Object.prototype.toggle=function(a,b){return this.forEach(function(){this.toggle(a,b)}),this},Object.prototype.toggleClass=function(a,b){a=a.split(" ");var c="toggle";return"undefined"!=typeof b&&(c=b?"add":"remove"),this.forEach(function(){var b=this;a.forEach(function(a){b.classList[c](a)})}),this},Object.prototype.trigger=function(a){return this.forEach(function(){this.trigger(a)}),this},String.prototype.fd=function(){var a=this.substr(0,10).split("-");return 3===a.length&&(a=(1===a[2].length?"0":"")+a[2]+"/"+(1===a[1].length?"0":"")+a[1]+"/"+a[0]),a},String.prototype.multiSelect=function(){return-1!==this.indexOf(" ")||-1!==this.indexOf(",")||-1!==this.indexOf(".")||-1!==this.indexOf("#")||-1!==this.indexOf(":")||-1!==this.indexOf("]")},String.prototype.noSpace=function(){return this.replace(/^\s+/g,"").replace(/\s+$/g,"")},window.FileReader&&window.Promise&&"formNoValidate"in document.createElement("input")){var µ=document;µ.setEvents("DOMContentLoaded",function(){"use strict";var a=(new Date,function(a,c){var d=b.cells.length+("undefined"==typeof c?1:c);return this.id=a.id,this.book=a,this.cell=one("#tempCell").cloneNode(!0).removeAttributes("id").toggleClass("bookcell",!0),this.cell.one("header").text(a.title),this.cell.one("figcaption").text(a.authors?a.authors.join(", "):""),this.cell.one(".previewable").toggle(!!a.access&&"NONE"!==a.access),this.cell.one(".personnal").toggle(_.isEqual(a.id.user,p.id)),this.cell.one(".recommanded").toggle(!!a.from),this.cell.one(".add").toggle(-1===p.bookindex(a.id)),this.cell.one(".remove").toggle(-1!==p.bookindex(a.id)),this.cell.col=d%f.nbcols,this.cell.row=Math.floor(d/f.nbcols),(a.alternative||a.base64)&&(this.cell.one(".cover").src=a.alternative||a.base64),this.active(),this}),b={add:function(a){b.cells=_.union(b.cells,_.isArray(a)?a:[a])},books:[],bytags:function(a){if(one("#collection").hasClass("active")){window.scroll(0,0),one("#formFilter").reset(),all(".bookcell").toggleClass("tofilter",!1),one("#selectedTag").html(a);for(var c=0,d=b.cells.length;d>c;c++){var e=b.cells[c];e.cell.toggleClass("tohide",!_.includes(e.book.tags,a))}b.display()}},cells:[],destroy:function(){f.remove(),b.books=b.cells=[]},display:function(a,c){return new Promise(function(d){if(!a&&one(".sortBy"))return b.sort.call(one(".sortBy"));a=a||_.sortBy(b.cells,function(a){return[a.row,a.col]});for(var e=0,g=f.get(),h=0,i=a.length;i>h;h++){var j=(a[h],a[h].cell);j.hasClass("tohide")||j.hasClass("tofilter")?f.get().one("section.notdisplayed").appendChild(j):(j.toggleClass("toshow",!0),g.one("[colid='"+(c?j.col:e%f.nbcols)+"']").appendChild(j),e++)}q.toggle(!1),b.loadcovers(),d(b.cells.length)})},filter:function(){var a=this.value.toLowerCase(),c=one("@last");if(this.checkValidity()&&a!==c.value){c.value=a;for(var d=0,e=b.cells.length;e>d;d++){var f=b.cells[d],g=f.book.title.toLowerCase(),h=f.book.subtitle?f.book.subtitle.toLowerCase():"",i=f.book.authors?f.book.authors.join(", ").toLowerCase():"",j=f.book.description.toLowerCase();f.cell.toggleClass("tofilter",-1===g.indexOf(a)&&-1===h.indexOf(a)&&-1===i.indexOf(a)&&-1===j.indexOf(a))}b.display()}},generate:function(c){return new Promise(function(d){for(var e=[],f=0,g=c.length;g>f;f++){if(b.one(c[f].id)||-1!==_.findIndex(e,_.matchesProperty("id",c[f].id)))return;e.push(new a(p.book(c[f].id)||c[f],f))}b.add(e),!one("#collection").hasClass("active")&&l.last&&(b.books=_.flattenDeep(b.books.push(c))),d(e)})},loadcovers:function(){for(var a=0,c=b.cells.length;c>a;a++)b.cells[a].loadcover();j.toggleFooter()},one:function(a){return _.find(b.cells,_.matchesProperty("id",a))},returned:function(a){b.one(a.id).returned(a)},show:function(a){for(var c=_.chunk(a,40),d=[],e=function(a){b.display(a,!0)},f=0,g=c.length;g>f;f++)d.push(b.generate(c[f]).then(e));return Promise.all(d)},sort:function(){if(window.scroll(0,0),!this.hasClass("active")){var a=this;one(".sortBy")&&h.blur.call(one(".sortBy").toggleClass("sortBy",!1)),h.hover.call(this).toggleClass("sortBy",!0),b.display(_.sortByOrder(b.cells,function(b){return b.book[a.getAttribute("by")]||null},"desc"!==a.getAttribute("sort")))}}},c=function(){var a;switch(this.setCustomValidity(""),this.name){case"confirmPwd":a=this.value!==one("@newPwd").value;break;case"filtre":a=!!this.value.length&&this.value.length<3;break;case"name":a=this.value.length<4;break;case"newPwd":a=this.value.length<4||this.value.length>12;break;case"pwd":a=this.value.length<4||this.value.length>12;break;case"recommand":a=this.value.toLowerCase()===p.id;break;case"searchinput":a=this.value.length<3;break;case"title":a=this.value.length<6}a&&this.setCustomValidity(this.getAttribute("error"))},d=new ColorThief,e={action:function(){var a,b=e.data.book.id,c=p.bookindex(b),d=this.getAttribute("actclick");-1!==c&&(a=p.books[c]),this.add=function(){if(b)n.emit("addDetail"),all("[actclick='upload']").toggle(!e.data.book.cover),e.newCell();else{for(var a,c=one("#formNew").formToJson(),d=all("#formNew input, #formNew textarea"),f=0,g=d.length;g>f;f++)if(!d[f].reportValidity()){a=!0;break}for(c.authors=c.authors?c.authors.split(","):[],f=0,g=c.authors.length;g>f;f++)c.authors[f]=c.authors[f].noSpace();if(a)return!1;q.over(),n.emit("newbook",c)}},this.associated=function(){l.associated(b)},this.update=function(){var c=!1,d={id:b},e=_.map(all("#userTags > div").toArray(),function(a){return a.one(".libelle").text()}),f=one("#userNote").value,g=one("#userComment").value,h=one("#detailCover").getAttribute("mainColor"),i=one("#detailCover").getAttribute("src")!==images["book-4-icon"].black?one("#detailCover").getAttribute("src"):null;if(_.isObject(b)&&b.user===p.id){var j=one("#formNew").formToJson();j.authors=j.authors.split(",")||[],_.forEach(j,function(b,e){b=b.noSpace(),_.isEqual(a[e],b)||(c=!0,d.update||(d.update={}),d.update[e]=b)})}(f||a.userNote)&&f!==a.userNote&&(c=!0,d.userNote=f),(g||a.userComment)&&g!==a.userComment&&(c=!0,d.userComment=g),(e.length||a.tags&&a.tags.length)&&!_.isEqual(e,a.tags)&&(c="tags",d.tags=e),h&&a.alternative!==i&&(c=!0,d.alternative=i,d.mainColor=h),c&&(d.userDate=(new Date).toJSON(),n.emit("updateBook",d),p.updatebook(d),o.init(),one("#tags").toggle(!!o.cloud.length&&one("#collection").hasClass("active"))),r.close()},this.upload=function(){one("#uploadHidden [type=file]").trigger("click")},this.preview=function(){one("@previewid").value=b,q.over(),r.open.call("previewWindow").then(function(a){one("#preview").submit()})},this.google=function(){window.open(this.getAttribute("link"))},this.recommand=function(){q.over(),r.open.call("recommandWindow")},this.close=function(){this.closest("window").fade(!1).then(function(){q.over(!1)})},this[d].call(this)},clickNote:function(){var a=one("#userNote"),b=this.getAttribute("note");a.value===b&&"1"===a.value?a.value=0:a.value=b,e.userNote()},data:{},links:function(){var a=this.getAttribute("searchby"),b=this.text();a&&b&&(one("#formSearch [type=search]","").value=b,all("#formSearch [name=searchby]")[a].checked=!0,one("#formSearch").trigger("submit"))},mainColor:function(a){var b=d.getColor(a),c="#"+((1<<24)+(b[0]<<16)+(b[1]<<8)+b[2]).toString(16).substr(1);return{rgb:b,hex:c}},modify:function(){if(this.hasClass("modify")){if(this.hasClass("hide"))for(var a=this.siblings("[name]"),b=0,c=a.length;c>b;b++)a[b].value=a[b].getAttribute("oldvalue");this.toggleClass("hide"),this.siblings("[field]:not(.noValue), [name]").toggle(null);var d=this.siblings("[name]")[0];d.focus(),"textarea"===d.tagName.toLowerCase()&&(d.scrollTop=0)}},mouseNote:function(){var a=one("#userNote").value||0,b=this.getAttribute("note"),c=all("[note]").toArray();if(a!==b)for(var d=0;d<Math.max(a,b);d++)d<Math.min(a,b)?c[d].src=images[c[d].getAttribute("select")].black:a>b?c[d].src=images[c[d].getAttribute("hoverminus")].black:c[d].src=images[c[d].getAttribute("hoverplus")].black},"new":function(){e.data.book={},e.show(!1),one("#formNew").reset(),all("#formNew input, #formNew textarea, .volumeInfo:not(.nonEditable), .volumeInfo:not(.nonEditable) button").toggle(!0),all("#formNew [field]").toggle(!1)},newCell:function(){all("[actclick=add], [actclick=update], #upload, .inCollection").toggle();var c=b.one(e.data.book.id);if(one("#collection").hasClass("active")&&!c){p.books.length%f.nbcols,all("[colid='"+p.books.length%f.nbcols+"'] .bookcell").length;c=new a(e.data.book),b.add(c),b.display()}c&&c.cell&&c.cell.all("button").fade(),p.addbook(e.data.book)},uploadCover:function(){var a=this.files;if(a[0]){if(!a[0].type.match(/image.*/)||a[0].size>5e5)return r.confirm("error","Veuillez sélectionner un fichier de type 'image' inférieure à 500KB."),!1;var b=new FileReader;b.onload=function(a){return function(b){a.onload=function(){var a=e.mainColor(this);this.toggleClass("new",!0).setAttribute("mainColor",a.hex),one("#detailContent").css("background","radial-gradient(whitesmoke 40%, "+a.hex+")")},a.src=b.target.result}}(one("#detailCover")),b.readAsDataURL(this.files[0])}},userNote:function(){for(var a=all("[note]").toArray(),b=one("#userNote").value,c=0;c<a.length;c++)b>c?a[c].src=images[a[c].getAttribute("select")].black:a[c].src=images[a[c].getAttribute("source")].black},show:function(a){var b=e.data.book,c=one("#detailWindow");one("#formNew").reset(),one("#formRecommand").reset(),c.all("#formNew input, #formNew textarea").toggle(!1),c.all("#formNew button:not(.categories)").toggleClass("hide",!1).toggleClass("modify",!!b.id&&_.isEqual(b.id.user,p.id)),c.one("#detailWindow [type=file]").value="",one("#comments").children.removeAll(),one("#userComment").value="",c.css({background:"whitesmoke","max-height":~~(.95*window.innerHeight)});for(var d=0,f=all("[note]").length;f>d;d++)h.blur.call(all("[note]")[d]);one("#userNote").value=b.note,c.all(".new").toggleClass("new",!1),c.all(".inCollection").toggle(!!a),o.list(),b.mainColor?c.css({background:"radial-gradient(whitesmoke 40%, "+b.mainColor+")"}):one("#detailCover").onload=function(){(b.alternative||b.base64)&&(b.mainColor=e.mainColor(this).hex,c.css({background:"radial-gradient(whitesmoke 40%, "+b.mainColor+")"}))},one("#detailCover").setAttributes("mainColor",null).src=b.alternative||b.base64||images["book-4-icon"].black,c.all(".direct").text(""),c.all("#userTags > div").removeAll(),c.one("#detailWindow .windowheader span").text(b.title||one("#detailWindow .windowheader span").getAttribute("label")),all("[actclick=add]").toggle(!a),all("[actclick=update], [actclick=recommand]").toggle(!!a),all("[actclick=associated]").toggle(!!b.id&&!_.isObject(b.id)),all("[actclick=preview]").toggle(!!b.access&&"NONE"!==b.access),all("[actclick=google]").setAttributes({link:b.link}).toggle(!!b.link),all("[actclick=upload]").toggle(!b.base64&&!b.cover&&!!a),c.all(".comments").toggle(!!b.comments&&!!b.comments.length),c.all("#detailWindow [field]").toggleClass("noValue",!1),c.all("[field=authors] span").removeAll(),c.all(".volumeInfo.nonEditable").toggle(!1),c.all(".volumeInfo:not(.nonEditable)").toggle(!!b.id&&_.isEqual(b.id.user,p.id)),e.userNote(),c.hasClass("notdisplayed")&&r.open.call("detailWindow"),_.forEach(b,function(a,d){var f=c.one("[field="+d+"]"),g=c.one("input[name="+d+"], textarea[name="+d+"]");switch(f&&"subtitle"!==d&&(f.closest("volumeInfo").toggle(!!a||_.isEqual(b.id.user,p.id)),f.toggle(!!a).toggleClass("noValue",!a)),d){case"authors":for(var h=0,i=a.length;i>h;h++)f.newElement("span",{"class":"link",searchby:3}).text(a[h]);g.value=a.join(", "),g.setAttribute("oldvalue",a.join(", ")),f.parentNode.all("button").toggle(!!a.length);break;case"tags":for(var j=one("#userTags"),k=0,l=a.length;l>k;k++)j.appendChild(o["new"](a[k]));break;case"userNote":a&&e.clickNote.call(one("[note='"+a+"']"));break;case"userComment":one("#userComment").value=a;break;case"comments":var m,n=0;a.length||c.one(".comments").toggle(!1);for(var q=0,r=a.length;r>q;q++){if(a[q].comment){var s=one("#tempComment").cloneNode(!0);s.removeAttribute("id"),s.one(".commentAuthor").text(a[q].name),s.one(".commentDate").text(a[q].date.fd()),s.one(".commentNote").text(a[q].note),s.one(".commentComment").html(a[q].comment),one("#comments").appendChild(s)}a[q].note&&(m=(m||0)+parseInt(a[q].note,10),n++)}"undefined"!=typeof m&&n&&(m=(m/n).toFixed(2),one(".subtitle").toggle(!0),one("#mNote").text(m));break;default:if(!f)break;_.isArray(a)&&(a=a.join(", ")),g&&(g.setAttribute("oldvalue",a),g.value=a,g.scrollTop=0),"time"===f.tagName.toLowerCase()&&(f.setAttribute("datetime",new Date(a)),a=a.fd()),"description"===d?f.html(a):f.text(a)}}),all(".link").setEvents("click",e.links,!1)}},f={get:function(){var a,c=one("#d");if(c||(c=µ.body.newElement("section",{id:"d",role:"main"}),c.newElement("section",{"class":"notdisplayed"})),a=(c.clientWidth/f.nbcols).toFixed(0),c.all(".col").length!==f.nbcols){c.all(".col").removeAll();for(var d=0;d<f.nbcols;d++)c.newElement("div",{"class":"col",colid:d}).css({width:a,"max-width":a});c.css({"padding-top":one("#nvb").isVisible()?one("#nvb").clientHeight:0}),all(".col").setEvents({dragenter:function(a){a.preventDefault()},dragover:function(a){a.preventDefault()},drop:function(a){a.preventDefault();var c=b.one(JSON.parse(a.dataTransfer.getData("text"))).cell,d=a.target.closest("bookcell");return d?c!==d&&(d.closest("col").insertBefore(c,d),b.loadcovers(),one(".sortBy")&&h.blur.call(one(".sortBy").toggleClass("sortBy",!1))):(this.appendChild(c),one(".sortBy")&&h.blur.call(one(".sortBy").toggleClass("sortBy",!1))),!1}})}return c},nbcols:~~(window.innerWidth/256),remove:function(){one("#d")&&(one("#d").removeAll(),window.scroll(0,0))},resize:function(){f.nbcols!==~~(window.innerWidth/256)?(o.close().then(o.destroy),all(".deroulant").fade(!1),f.nbcols=~~(window.innerWidth/256),f.remove(),b.display()):all(".col").css({width:~~(window.innerWidth/f.nbcols),"max-width":~~(window.innerWidth/f.nbcols)}),one("#detailWindow").isVisible()&&one("#detailWindow").css({height:~~(.95*window.innerHeight),"max-height":~~(.95*window.innerHeight)})}},g={deleteDetail:function(a){g.db&&g.db.transaction(["details"],"readwrite").objectStore("details")["delete"](a)},deleteQuery:function(a){g.db&&g.db.transaction(["queries"],"readwrite").objectStore("queries")["delete"](a)},getDetail:function(a){return new Promise(function(b){g.db||b();var c=g.db.transaction(["details"],"readwrite").objectStore("details").index("by_id").get(a);c.onsuccess=function(){this.result?b(this.result):b()},c.onerror=function(){b()}})},getQuery:function(a){return new Promise(function(b,c){g.db||c();var d=g.db.transaction(["queries"],"readwrite").objectStore("queries").index("by_query").get(JSON.stringify(a));d.onsuccess=function(){this.result&&this.result.books.length?b(this.result.books):c()},d.onerror=c})},init:function(){return g.indexedDB=window.indexedDB||window.mozIndexedDB||window.webkitIndexedDB||window.msIndexedDB,new Promise(function(a,b){if(g.indexedDB){var c=indexedDB.open(p.session,1);c.onerror=function(){b()},c.onsuccess=function(){g.db=this.result,a()},c.onupgradeneeded=function(){var a=this.result;a.createObjectStore("queries",{keyPath:"query"}).createIndex("by_query","query",{unique:!0}),a.createObjectStore("details",{keyPath:"id"}).createIndex("by_id","id",{unique:!0})}}})},setDetail:function(a){if(g.db){g.db.transaction(["details"],"readwrite").objectStore("details").put(a)}},setQuery:function(a,b){if(g.db){g.db.transaction(["queries"],"readwrite").objectStore("queries").put({query:JSON.stringify(a),books:b})}}},h={active:function(){var a=one(".active"),b=this.one("img");return a&&(a.toggleClass("active",!1),h.blur.call(a)),this.toggleClass("active",!0),one("#tags").toggle("collection"===this.id&&!!o.cloud.length),b&&(b.src=images[b.getAttribute("source")][b.getAttribute("active")]),this},blur:function(){var a="img"===this.tagName.toLowerCase()?this:this.one("img");return this.hasClass("active")||this.hasClass("sortBy")?!1:(a&&(a.src=images[a.getAttribute("source")][a.getAttribute("blur")],a.isVisible()||a.hasClass("nsv")||a.css({visibility:"visible"})),this)},hover:function(){var a="img"===this.tagName.toLowerCase()?this:this.one("img");return this.hasClass("active")||this.hasClass("sortBy")?!1:(a&&(a.src=images[a.getAttribute("source")][a.getAttribute("hover")]),this)}},i=function(){return p.destroy(),b.destroy(),n.close(),g.indexedDB&&g.indexedDB.deleteDatabase(p.id),window.location.assign("/logout")},j={close:function(a){var b=a.target.closest("action");one("#contextMenu").isVisible()&&!a.target.getAttribute("nav")&&one("#contextMenu").fade(!1),b&&_.includes(["notifications","tris"],b.getAttribute("id"))||all(".deroulant").fade(!1)},context:function(a){a.preventDefault();var b=one("#contextMenu");return!one("#detailWindow").isVisible()||one("#w").hasClass("over")||_.isEmpty(e.data.book)||b.css({top:a.clientY+b.clientHeight>window.innerHeight?a.clientY-b.clientHeight:a.clientY,left:a.clientX+b.clientWidth>window.innerWidth?a.clientX-b.clientWidth:a.clientX}).fade(!0),!1},link:function(){window.open(this.getAttribute("url"))},mail:function(){µ.location.href="mailto:"+this.getAttribute("mail")},nav:function(){if(!e.data.cell)return!1;var a=e.data.cell,b=a.index(),c=parseInt(a.parentNode.getAttribute("colid"),10);switch(this.getAttribute("nav")){case"top":if(!b)return!1;b--;break;case"right":c++,c===f.nbcols&&(c=0,b++);break;case"left":c||(c=f.nbcols,b--),c--;break;case"bottom":b++}return one("[colid='"+c+"']").childNodes[b]&&one("[colid='"+c+"']").childNodes[b].one(".cover").trigger("click"),!1},notif:function(a){var b=one("#notifs");a&&one("#sort").fade(!1),b.isVisible()?b.fade(!1):b.css({top:one("#nvb").clientHeight+5,left:one("#notifications").offsetLeft}).fade(.95)},selectstart:function(a){return a.preventDefault(),a.target.tagName&&!_.includes(["input","textarea"],a.target.tagName.toLowerCase())?!1:void 0},show:function(){h.hover.call(one("#sort img")),all("#tags, #notifications").toggle(!1)},sort:function(a){var b=one("#sort");a&&one("#notifs").fade(!1),b.isVisible()?b.fade(!1):b.css({top:one("#nvb").clientHeight+5,left:one("#tris").offsetLeft}).fade(.95)},toggle:function(){all(".nvb").fade().then(function(){one("#d").css({"padding-top":one("#nvb").isVisible()?one("#nvb").clientHeight:0})})},toggleFooter:function(){one("#footer").toggle(!!s().top)},top:function(){var a=setInterval(function(){var b=(s().top/2-.1).toFixed(1);window.scroll(0,b),.1>=b&&(window.scroll(0,0),clearInterval(a))},100)}},k={click:function(){var a=JSON.parse(this.getAttribute("notif"));a._id.book;_.remove(k.list,a),k.last=a,one("#notifs").toggle(),this.removeAll(),all("#notifications, #notifNumber").toggle(!!k.list.length),one("#notifNumber").text(k.list.length),q.toggle(!0,!0),n.emit("readNotif",a)},show:function(a){a&&(k.list=a),all("#notifications, #notifNumber").toggle(!!k.list.length),one("#notifNumber").text(k.list.length);for(var b=0,c=k.list.length;c>b;b++){var d=k.list[b],e=one("#tempNotif").cloneNode(!0);e.setAttributes({notif:JSON.stringify(d)}).removeAttribute("id"),e.one(".notifName").html(d.from),e.one(".notifTitle").text(d.title),e.setEvents("click",k.click),one("#notifs").appendChild(e)}}},l={associated:function(a){l.clear(),l.last={associated:a},r.close(!0).then(function(){q.toggle(!0,!0).then(function(){g.getQuery(l.last).then(b.show,function(){one("#nvb").toggleClass("inactive",!0),q.anim(!0),n.emit("associated",a)})})})},books:function(a){a.preventDefault();var c=this.formToJson();return l.last={q:c.searchby+c.searchinput,langRestrict:c.langage},one("@filtre").value=one("@last").value="",l.clear(),r.close(!0).then(function(){q.toggle(!0,!0).then(function(){g.getQuery(l.last).then(b.show)["catch"](function(){one("#nvb").toggleClass("inactive",!0),q.anim(!0),n.emit("searchBooks",l.last)})})}),!1},clear:function(){b.destroy(),f.remove(),h.active.call(one("#recherche")),one("#formFilter").reset(),one(".sortBy")&&h.blur.call(one(".sortBy").toggleClass("sortBy",!1)),one("#selectedTag").text("")},endRequest:function(a){one("#nvb").toggleClass("inactive",!1),q.anim(!1),a||q.toggle(!1),!one("#collection").hasClass("active")&&l.last&&g.setQuery(l.last,b.books)},gtrans:function(){var a=this.id;r.confirm("warning","Cette opération va importer/exporter vos EBooks depuis/vers votre bibliothèque Google.<BR>Etes vous sur de vouloir continuer?").then(function(){return"exportNow"===a?n.emit("exportNow"):(b.destroy(),h.active.call(one("#collection")),one("#nvb").toggleClass("inactive",!0),q.anim(!0),void r.close(!0).then(function(){q.toggle(!0,!0),n.emit("importNow")}))})},recommand:function(){l.clear(),l.last={recommand:p.id},r.close(!0).then(function(){q.toggle(!0,!0).then(function(){g.getQuery(l.last).then(b.show)["catch"](function(){one("#nvb").toggleClass("inactive",!0),q.anim(!0),n.emit("recommanded")})})})}},m=function(a){if(a=a||window.event,!a.altKey)if(a.ctrlKey){var b;switch(a.keyCode){case 77:j.toggle(),b=!0;break;case 76:i(),b=!0;break;case 82:one("#recherche").trigger("click"),b=!0;break;case 80:one("#profil").trigger("click"),b=!0;break;case 66:one("#collection").trigger("click"),b=!0;break;case 69:one("#tags").trigger("click"),b=!0;break;case 73:one("#contact").trigger("click"),b=!0}if(b)return a.preventDefault(),!1}else 27===a.keyCode&&(r.close(),o.close(),one("#contextMenu").fade(!1))},n=io({reconnection:!0}),o={add:function(a){a.preventDefault();var b=this.formToJson().tag.toLowerCase(),c=all("#userTags > div").toArray(),d=_.find(c,function(a){return a.one(".libelle").html()===b});if(!d){c.push(o["new"](b,!0)),c=_.sortBy(c,function(a){return a.one(".libelle").text()});for(var e=0,f=c.length;f>e;e++)one("#userTags").appendChild(c[e])}return this.reset(),!1},close:function(){return new Promise(function(a){one("#cloud").isVisible()?o.show().then(a):(q.over(!1),a())})},destroy:function(){all("#cloud span").removeAll()},generate:function(){var a=one("#cloud"),c=function(){o.show(),b.bytags(this.text()),q.toggle(!1)},d=~~(a.clientHeight/2),e=~~(a.clientWidth/2),f=e/d,g=3,h=[],i=function(a,b){for(var c=function(a,b){return Math.abs(2*a.offsetLeft+a.offsetWidth-2*b.offsetLeft-b.offsetWidth)<a.offsetWidth+b.offsetWidth&&Math.abs(2*a.offsetTop+a.offsetHeight-2*b.offsetTop-b.offsetHeight)<a.offsetHeight+b.offsetHeight},d=0,e=b.length;e>d;d++)if(c(a,b[d]))return!0;return!1};o.destroy();for(var j=0,k=o.cloud.length;k>j;j++){var l=o.cloud[j],m=a.newElement("span",{title:l.weight,"class":"tag tag"+Math.min(~~(l.weight/5)+1,10)}).html(l.text),n=d-m.clientHeight/2,p=e-m.clientWidth/2,r=0,s=6.28*Math.random();for(m.css({top:n,left:p});i(m,h);)r+=g,s+=(j%2===0?1:-1)*g,n=d+r*Math.sin(s)-m.clientHeight/2,p=e-m.clientWidth/2+r*Math.cos(s)*f,m.css({top:n,left:p});h.push(m)}a.all("span").setEvents("click",c)},init:function(){var a=_.countBy(_.flatten(_.compact(_.pluck(p.books,"tags")),!0).sort());if(o.cloud=[],o.destroy(),a){var b="";_.forEach(a,function(a,c){o.cloud.push({text:c,weight:a}),b+="<option>"+c+"</option>"}),one("#tagsList").html(b),o.cloud=_.sortBy(o.cloud,"weight").reverse()}},list:function(){one("@tag").setAttributes({list:this.value?"tagsList":"none"})},"new":function(a,c){var d=one("#tempTag").cloneNode(!0);return d.removeAttribute("id"),d.setEvent("click",function(a){a.target.hasClass("libelle")?(r.close(),b.bytags(a.target.text())):this.fade(!1).then(function(){d.removeAll(),one("#detailWindow [autofocus]").focus()})}),d.one(".libelle").html(a).toggleClass("new",!!c),d},show:function(){var a=one("#cloud"),b=a.isVisible();return new Promise(function(c){one("#wa").isVisible()||!one("#collection").hasClass("active")?c():r.close().then(function(){all("html").toggleClass("overflown",!b),b?a.fade(!1).then(c):a.fade(.9).then(function(){a.all("span").length||o.generate(),c()})})})}},p={addbook:function(a){-1===p.bookindex(a.id)&&(p.books.push(a),p.books=_.sortBy(p.books,"title"));var c=b.one(a.id);c&&(c.book=a),one("#nbBooks").text(p.books.length)},book:function(a){return _.find(this.books,_.matchesProperty("id",a))},bookindex:function(a){return _.findIndex(this.books,_.matchesProperty("id",a))},collection:function(){return r.close(),one("@filtre").value=one("@last").value=one("#selectedTag").innerHTML="",one("#collection").hasClass("active")?(window.scroll(0,0),all(".bookcell").toggleClass("tofilter tohide",!1),one("#sort [by]").trigger("click")):(b.destroy(),q.anim(!0),q.toggle(!0,!0).then(function(){one("#nvb").toggleClass("inactive",!0),h.active.call(one("#collection")),b.show(p.books).then(l.endRequest)})),!1},"delete":function(){return one("#errPwd").toggle(!1),one("@pwd").reportValidity()?(r.confirm("warning",one("#delete").getAttribute("confirm")).then(function(){n.emit("deleteUser",one("@pwd").value)}),!1):void 0},destroy:function(){for(var a in this)_.isFunction(this[a])||delete this[a]},init:function(a){return a.id?(_.assign(this,a),this.picture&&this.link&&one("#picture").toggle(!0).newElement("img",{src:this.picture,title:"Google+"}).setEvents("click",function(){window.open(p.link)}),this.googleSignIn&&all(".gSignIn").toggleClass("notdisplayed"),this.first&&one("#profileWindow").trigger("click"),void g.init()):i()},nokdated:function(){return one("#errPwd").toggle(!0),!1},removebook:function(a){return _.remove(this.books,_.matchesProperty("id",a)),this.books.length},update:function(){return one("#errPwd").fade(!1),n.emit("updateUser",this.serialize()),!1},updated:function(a){p.name=a.name,p.googleSync=a.googleSync,r.close()},updatebook:function(a){var c=p.bookindex(a.id);_.assign(a,a.update),delete a.update,-1!==c&&_.assign(this.books[c],a);var d=b.one(a.id);d&&(a.title||a.authors||a.alternative)&&(a.title&&d.cell.one("header").text(a.title),a.authors&&d.cell.one("figcaption").text(a.authors.join(", ")),a.alternative&&(d.cell.one(".cover").src=a.alternative))},updatetags:function(){o.init()}},q={anim:function(a){one("#wa").fade(a)},over:function(a){one("#w").toggleClass("over",a)},toggle:function(a,b){return q.p=new Promise(function(c){var d=one("#w");d.one("img").toggle(!!b),d.isVisible()===a||r.on||q.on?c():(q.on=!0,all(".description").removeAll(),a?(all("html").toggleClass("overflown",!0),d.fade(.5).then(c)):d.fade(!1).then(function(){all("html").toggleClass("overflown",!1),q.over(!1),c()}))}),q.p.then(function(){delete q.on}),q.p}},r={close:function(a){return new Promise(function(b){var c=all(".window:not(.notdisplayed)"),d=all("form:not(#formFilter)");if(q.over(!1),µ.removeEventListener("keyup",m),c.length){for(var e=0,f=d.length;f>e;e++)d[e].reset();c.fade(!1).then(function(){delete r.on,a===!0?b():q.toggle().then(b)})}else b()})},confirm:function(a,b){return new Promise(function(c,d){q.over(),one("#confirmWindow header span").text(one("#confirmWindow header span").getAttribute(a)),one("#confirmWindow #confirm").text(b),all("#confirmWindow button").setEvents("click",r.close),one("#confirmWindow .valid").setEvents("click",function(){c()}),one("#confirmWindow .cancel").toggle("warning"===a).setEvents("click",function(){d()}),q.toggle(!0).then(function(){one("#confirmWindow").css({top:s().top+10,left:"25%"}).fade(!0),µ.setEvents({"keyup keydown":Window.esc})})})},esc:function(a){27===a.keyCode&&r.close()},open:function(){var a=this;return new Promise(function(b,c){
var d="string"==typeof a?a:a.getAttribute("window"),e=one("#"+d);r.on&&r.on===d?r.close().then(b):o.close().then(function(){one("#wa").isVisible()&&b(),_.includes(["previewWindow","recommandWindow"],d)||all(".window:not(.notdisplayed)").fade(!1),"profileWindow"===d&&(one("@mail").value=p.id,one("@name").value=p.name,p.googleSignIn?(one("@googleSignIn").setAttribute("checked",!0),p.googleSync&&one("@googleSync").setAttribute("checked",!0)):one("@pwd").setAttribute("required",!0),one(".changePwd.notdisplayed")||r.togglePwd()),q.toggle(!0).then(function(){r.on=d,e.css({top:s().top+10}).fade(!0),e.one("[autofocus]")&&e.one("[autofocus]").focus(),b()}),all(".errMsg").toggle(!1)})})},togglePwd:function(){all(".changePwd").fade().then(function(a){for(var b=0,c=a.length;c>b;b++)a[b].all("[type=password]").setAttributes({required:a[b].isVisible()})})}},s=function(){return{top:window.scrollY||µ.documentElement.scrollTop,left:window.scrollX||µ.documentElement.scrollLeft}};a.prototype.active=function(){if(!this.actived){var a=function(){var a=this.classList;k.cell.all("button").fade(),_.includes(a,"add")&&n.emit("addBook",k.id),_.includes(a,"remove")&&(one("#collection").hasClass("active")&&k.cell.fade().then(function(){k.cell.removeAll(),b.loadcovers()}),n.emit("removeBook",k.id),one("#nbBooks").text(p.removebook(k.id)),k.book.tags.length&&o.init())},c=function(a){if(a.relatedTarget&&!a.relatedTarget.hasClass("description")&&all(".description").removeAll(),"mouseenter"===a.type&&k.book.description){var b=k.book.description.indexOf(" ",500),c=function(){this.removeAll()},d={"max-height":window.innerHeight,left:Math.min(this.xposition()+this.clientWidth/3,window.innerWidth-1.333*this.clientWidth).toFixed(0)},e=(this.offsetTop+this.clientHeight/3).toFixed(0),f=µ.body.newElement("div",{width:this.clientWidth,bookid:k.id,"class":"description notdisplayed"}).css({width:this.clientWidth}).setEvents("click",c).html("<span>"+k.book.title+"</span><BR>"+k.book.description.substr(0,Math.max(b,500))+(-1!==b?"...":""));e+f.clientHeight>µ.clientHeight?d.bottom=.333*this.clientHeight:d.top=e,f.css(d),setTimeout(function(){f.setEvents("mouseleave",c).fade(.9)},1e3)}},d=function(){return-1!==p.bookindex(k.id)||k.opened?(e.data=k,e.show(-1!==p.bookindex(k.id))):g.getDetail(k.id).then(function(a){a?(e.data.book=a,e.show(!1)):(q.toggle(!0,!0),n.emit("searchDetail",k.id))}),!1},f=function(a){this.toggleClass("isDrag",!0),a.dataTransfer.effectAllowed="move",a.dataTransfer.dropEffect="move",a.dataTransfer.setData("text",JSON.stringify(i))},h=function(){this.toggleClass("isDrag",!1)},i=this.id,j=function(){if(k.cell.hasClass("toshow")){var a=k.cell.one(".cover");a&&window.innerHeight+s().top>k.cell.offsetTop&&(k.cell.toggleClass("toshow",!1),k.cell.setEvents({dragstart:f,dragend:h}),(k.book.alternative||k.book.base64)&&(a.src=k.book.alternative||k.book.base64),k.cell.one("footer").css({bottom:k.cell.one("figcaption").clientHeight+5}))}},k=this;this.cell.all("header, figure").setEvents("click",d),this.cell.all("button").setEvents("click",a),this.cell.setEvents({"mouseenter mouseleave":c,dragstart:f,dragend:h}),this.cell.one("footer").css({bottom:this.cell.one("figcaption").clientHeight+5}),this.actived=!0,this.loadcover=j}},a.prototype.returned=function(a){this.book=a,this.opened=!0,e.data=this,e.show(),g.setDetail(a)},n.on("books",b.show).on("collection",function(a){p.books=a.books,o.init(),one("#collection").trigger("click"),one("#nbBooks").text(p.books.length),k.show(a.notifs)}).on("connect",function(){n.emit("isConnected")}).on("covers",function(a){for(var c=0,d=a.length;d>c;c++){var f=a[c],g=p.books[f.index],h=b.cells[f.index];if(g.base64=f.base64,h&&h.cell){var i=h.cell;i.hasClass("toshow")||(i.one(".cover").src=f.base64),e.data.book&&e.data.book.id===g.id&&(one("#detailCover").src=f.base64)}}}).on("disconnect",function(){p.destroy(),r.close(),q.toggle(!0,!0),all(".deroulant").toggle(!1),b.destroy()}).on("endRequest",l.endRequest).on("error",function(a){}).on("logout",i).on("newbook",function(a){e.bookid=a.id,e.data={book:a},e.newCell(),e.show(!0),q.over(!1)}).on("reconnect",function(){n.io.reconnect()}).on("returnAdd",p.addbook).on("returnDetail",b.returned).on("returnNotif",function(a){e.bookid=a.id,e.data={book:a},e.show(-1!==p.bookindex(a.id))}).on("updateNok",p.nokdated).on("updateOk",p.updated).on("user",function(a){j.show(),p.init(a)}),µ.setEvents({"keyup keydown":m,scroll:b.loadcovers}),all("input").setEvents("input propertychange",c),one("#logout").setEvent("click",i),one("#formSearch").setEvent("submit",l.books),one("#formProfil").setEvent("submit",p.update),one("#formRecommand").setEvent("submit",e.sendNotif),one("#formTag").setEvent("submit",o.add),all("#formNew, #formFilter").setEvents("submit",function(a){a.preventDefault()}),all("#formNew button").setEvents("click",e.modify),one("#changePwd").setEvent("click",r.togglePwd),one("#delete").setEvent("click",p["delete"]),one("#tris").setEvent("click",j.sort),one("#notifications").setEvent("click",j.notif),all("#sort > div").setEvents("click",b.sort),all("img[actclick]").setEvents({mouseenter:h.hover,mouseleave:h.blur}),all("[actclick]").setEvents("click",e.action),all(".closeWindow").setEvents("click",r.close),one("#footer").setEvent("click",j.top),all("#uploadHidden [type=file]").setEvents("change",e.uploadCover),all("#userNote > img").setEvents({mouseenter:e.mouseNote,mouseleave:e.userNote,click:e.clickNote}),all(".nvb > div:not(#picture):not(.filtre), img.closeWindow, #footer, [by], .imgAction img, #cloud img, #contactsWindow img, [nav]").setEvents({mouseenter:h.hover,mouseleave:h.blur}),function(a){for(var b=0,c=a.length;c>b;b++)h.blur.call(a[b])}(all("[blur]")),all("img").setAttributes({draggable:!1}),one("#nvb").toggleClass("notdisplayed",!1),one("#collection").setEvent("click",p.collection),all("#tags, #cloud > img").setEvents("click",o.show),all("#recherche, #profil, #contact").setEvents("click",r.open),one("#newbook").setEvent("click",e["new"]),all(".tnv").setEvents("click",j.toggle),all("[url]").setEvents("click",j.link),all("[mail]").setEvents("click",j.mail),one("#recommand4u").setEvent("click",l.recommand),all("#importNow, #exportNow").setEvents("click",l.gtrans),all("@tag").setEvents("input propertychange",o.list),window.setEvents({contextmenu:j.context,resize:f.resize,click:j.close,selectstart:j.selectstart}),all("[nav]").setEvents("click",j.nav),function(a){a?one("@filtre").setEvent("search",b.filter):one("#formFilter").setEvent("submit",function(a){return b.filter.call(one("@filtre")),!1})}("onsearch"in µ.createElement("input"))})}else alert(document.body.getAttribute("error"));
