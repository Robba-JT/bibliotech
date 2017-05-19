"use strict";require.config({paths:{cjson:"../lib/cjson.min",dom:"../lib/dom",emitter:"../lib/emitter",errors:"../lib/errors",hdb:"../lib/handlebars.min",lodash:"../lib/lodash",Request:"../lib/Request",store:"../lib/storage",text:"../lib/require-text.min",Thief:"../lib/color-thief.min"},shim:{dom:{exports:"µ"},emitter:{exports:"em"},errors:{exports:"err"},lodash:{exports:"_",deps:["./lib/lodash.min"]},Request:{exports:"req"},Thief:{exports:"ColorThief"},store:{deps:["cjson"],exports:"store"}}}),define("biblioHdb",["hdb"],function(a){a.registerHelper("eachAuthors",function(a){var b="";return _.forEach(_.split(_.trim(a),","),function(a){b+='<span searchby="inauthor:">'+a+"</span>"}),b}),a.registerHelper("formatDate",function(a,b){var c={year:"numeric",month:"long",day:"numeric"};return a?new Date(a).toLocaleDateString(b||"fr",c):void 0}),a.registerHelper("formatInputDate",function(a){return a?new Date(a).toISOString().slice(0,10):void 0}),a.registerHelper("ifCover",function(a,b,c){return a||b?c.fn(this):c.inverse(this)}),a.registerHelper("ifISBN",function(a,b,c){return a||b?c.fn(this):void 0}),a.registerHelper("ifPers",function(a,b){return _.isPlainObject(a)&&a.user===em.emit("getUser")?b.fn(this):b.inverse(this)}),a.registerHelper("ifRec",function(a,b){return _.isPlainObject(a)&&a.user!==em.emit("getUser")?b.fn(this):b.inverse(this)})}),define("cells",["hdb","text!../templates/Cell"],function(a,b){var c=a.compile(b),d=µ.one("bookcells"),e=new ColorThief,f=function j(a,b){var d=this;if(!(this instanceof j))return new j(a,b);if(this.id=_.isPlainObject(a.id)?JSON.stringify(a.id):_.get(a,"id"),this.src=_.get(a,"src"),this.book=_.omit(a,"src"),this.cell=µ["new"]("cell").set({innerHTML:c(_.merge(this.book,{inCollection:b,src:this.src})),draggable:!0,book:this.id}).css({width:i}).observe("mouseleave",function(){d.cell.one("figure span").toggleClass("notdisplayed",!1)}),this.src||!this.book.cover&&!this.book.alt||(this.src="/cover/"+this.id+"?"+Math.random().toString(24).slice(2)),_.has(a,"description")){var f=_.get(a,"description"),g=f.indexOf(" ",500);this.cell.one("figure span").observe("click",function(a){a.stopPropagation(),a.element.toggleClass("notdisplayed",!0)}).html=f.substr(0,Math.max(500,g))+(-1===g?"":"...")}this.cell.one(".add").observe("click",function(a){a.stopPropagation(),d.add()}),this.cell.one(".remove").observe("click",function(a){a.stopPropagation(),d.remove()}),this.cell.observe("click",function(){return em.emit("openDetail",d)}).observe("dragstart",function(a){a.element.toggleClass("isDrag",!0),a.dataTransfer.setData("book",d.id)}).observe("dragend",function(a){a.element.toggleClass("isDrag",!1)}).observe("dragover",function(a){a.preventDefault()}).observe("drop",function(a){a.preventDefault(),d.cell.prepend(µ.one("[book='"+a.dataTransfer.getData("book")+"']")),µ.one("#collection").hasClass("active")&&µ.one("#selectedTag span").text&&µ.one("#saveorder").toggleClass("notdisplayed",!1),em.emit("resetSort")});var h=this.cell.one("img");if(h.loaded=function(){h.toggleClass("notdisplayed",!1),h.siblings.get(0)&&h.siblings.get(0).remove(),_.assign(d.book,{palette:e.getPalette(h.element)}),d.book.palette&&d.book.palette.length>2&&(d.changeBackground(d.book.palette[1]),d.cell.observe("mouseover",function(){d.changeBackground(d.book.palette[0])}),d.cell.observe("mouseleave",function(){d.changeBackground(d.book.palette[1])}))},this.src)var k=this.defLoad=function(){d.isVisible()?(window.removeEventListener("scroll",k),h.element.src=d.src):window.addEventListener("scroll",k)};return this},g=function(){var a=this;this.cells=[],em.on("showCells",this,this.show),em.on("resetCells",this,this.reset),em.on("resize",this,this.resize),em.on("saveOrder",this,this.saveOrder),em.on("newBook",this,this.newBook),em.on("getCell",function(b){return em.emit("fromCollection",b.id)||a.getCell(b)}),em.on("cellsReset",this,this.reset),em.on("cellsShow",this,this.show),em.on("cellsSort",this,this.sort)},h=function(){d.toggleClass("scrolled",!0),i=~~(d.element.scrollWidth/~~(d.element.scrollWidth/257))-5+"px",d.toggleClass("scrolled",!1)},i=null;return f.prototype.add=function(){em.emit("addBook",this),this.cell.many("button").toggleClass("notdisplayed")},f.prototype.changeBackground=function(a){return this.cell.css("background-color",µ.rgbToHex(a)).one("figcaption").css("color",µ.isDark(a)?"whitesmoke":"black"),this},f.prototype.filter=function(){var a=_.words(_.toLower(_.noAccent(µ.one("#selectedSearch span").text))),b=a.length,c=µ.one("#selectedTag span").text,d=_.toLower(_.noAccent(_.concat(this.book.title,this.book.subtitle||"",this.book.authors||"",this.book.description||"").join(" "))),e=c?_.includes(this.book.tags,c):!0;return e&&b&&_.forEach(a,function(a){return e=_.includes(d,a)}),this.cell.toggleClass("notdisplayed",!e),e&&this.defLoad&&this.defLoad(),this},f.prototype.isVisible=function(){return document.body.scrollTop+window.outerHeight>this.cell.element.offsetTop&&this.cell.visible},f.prototype.resize=function(){return this.cell.css({width:i}),this},f.prototype.remove=function(){em.emit("removeBook",this.id),this.book.inCollection=!1,µ.one("#collection").hasClass("active")?this.cell.remove():this.cell.many("button").toggleClass("notdisplayed")},f.prototype.update=function(a){var b=arguments.length>1&&void 0!==arguments[1]?arguments[1]:!1,c=_.get(a,"volumeInfo")||{};return _.get(a,"alt")!==_.get(this.book,"alt")&&(this.src="/cover/"+this.id+"?"+Math.random().toString(24).slice(2),this.cell.one("img").set("src",this.src)),_.assign(this.book,_.omit(a,"volumeInfo"),c,{inCollection:b}),this.cell.one("header").text=this.book.title,this.cell.one("figcaption div").text=this.book.authors,this.cell.one("figure span").html=this.book.description,this.cell.set("book",this.id),this},g.prototype.getCell=function(a,b){return new f(a,b)},g.prototype.getCells=function(a,b){var c=this;return h(),_.map(a,function(a){return c.getCell(a,b)})},g.prototype.newBook=function(){var a=new f({id:{user:em.emit("getUser")}});a.cell.one("img").trigger("click")},g.prototype.resize=function(){return h(),_.forEach(this.cells,function(a){return a.resize()}),this},g.prototype.reset=function(){return d.html="",this.cells=[],µ.one("#saveorder").toggleClass("notdisplayed",!0),em.emit("defaultSort"),this},g.prototype.saveOrder=function(){var a=µ.many("cell").elements,b={tag:µ.one("#selectedTag span").text,list:_.reduce(a,function(a,b){return b.visible&&a.push(b.get("book")),a},[])};em.emit("updateOrder",b),µ.one("#saveorder").toggleClass("notdisplayed",!0)},g.prototype.show=function(a){return _.forEach(a,function(a){d.append(a.cell.toggleClass("notdisplayed",!1)),a.defLoad&&a.defLoad()}),this.cells=_.unionBy(this.cells,a,"id"),this},g.prototype.sort=function(a,b){return _.forEach(_.orderBy(this.cells,"book."+a,b||"asc"),function(a){d.append(a.cell)}),this},window.addEventListener("resize",function(){return em.emit("resize")}),new g}),define("cloud",["text!../templates/cloud"],function(a){var b=µ.one("cloud").set("innerHTML",a),c=function(){var a=this;em.on("generateTags",this,function(a){this.list=a,this.reset().generate()}),em.on("openCloud",this,this.open),em.on("closeCloud",this,this.close),em.on("resize",this,function(){a.close().reset().generate(a.list)}),em.on("updateTag",this,this.update),em.on("getCloudOptions",function(){return a.options}),b.one("div").observe("click",this.close)},d=function(a,b){this.title=a,this.weight=b,this.span=µ["new"]("span",{innerHTML:a,title:b}).toggleClass("tag tag"+Math.min(~~(b/5)+1,10))};return d.prototype.appendTo=function(a){return this.span&&this.span.appendTo(a),this},c.prototype.close=function(){return b.toggleClass("invisible",!0),µ.one("html").toggleClass("overflown",!1),this},c.prototype.generate=function(){var a=this;if(_.reduce(this.list,function(a,b){return _.forEach(b.tags,function(b){_.has(a,b)||(a[b]=0),a[b]+=1}),a},this.computedList={}),_.isEmpty(this.computedList))µ.one("#tags").toggleClass("notdisplayed",!0);else{var c=~~(b.get("clientHeight")/2),e=~~(b.get("clientWidth")/2),f=e/c,g=3,h=function(a,b){for(var c=b.length,d=function(a,b){return Math.abs(2*a.offsetLeft+a.offsetWidth-2*b.offsetLeft-b.offsetWidth)<a.offsetWidth+b.offsetWidth&&Math.abs(2*a.offsetTop+a.offsetHeight-2*b.offsetTop-b.offsetHeight)<a.offsetHeight+b.offsetHeight},e=0;c>e;e+=1)if(d(a.element,b[e].element))return!0;return!1};_.forIn(this.computedList,function(i,j){var k=new d(j,i).appendTo(b),l=k.span,m=c-l.get("clientHeight")/2,n=e-l.get("clientWidth")/2,o=0,p=6.28*Math.random();for(l.css({top:m,left:n});h(l,a.tags);)o+=g,p+=(a.tags.length%2===0?1:-1)*g,m=c+o*Math.sin(p)-l.get("clientHeight")/2,n=e-l.get("clientWidth")/2+o*Math.cos(p)*f,l.css({top:m,left:n});l.observe("click",function(){a.close(),em.emit("filtreTag",j)}),a.tags.push(l),a.options.push('<option value="'+j+'">'+j+"</option>")}),this.options.sort(),µ.one("#collection").hasClass("active")&&µ.one("#tags").toggleClass("notdisplayed",!1)}return this},c.prototype.open=function(){return µ.one("html").toggleClass("overflown",!0),b.toggleClass("invisible",!1),µ.one("#saveorder").toggleClass("notdisplayed",!0),this},c.prototype.reset=function(){return this.tags=[],this.options=[],b.set("innerHTML",a).one("div").observe("click",this.close),this},c.prototype.update=function(a){var b=_.find(this.list,["id",a.id]);return b?b.tags=a.tags:this.list.push(a),this.reset().generate(),µ.one("#selectedTag").visible&&µ.one("#selectedTag span").text&&em.emit("filtreTag",µ.one("#selectedTag span").text),this},new c}),define("collection",["cells"],function(a){var b=function(){this.tags={},this.cells=[],em.once("init",this,this.init),em.on("showCollection",this,this.show),em.on("addBook",this,function(a){var b=this;this.has(a.id)||req("/book/"+a.id,"POST").send().then(function(c){a.update(c,!0),b.cells.push(a),b.cells=_.sortBy(b.cells,["book.title"]),µ.one("#nbBooks").text=b.cells.length,µ.one("#collection").hasClass("active")&&b.show()})["catch"](function(a){err.add(a)})}),em.on("removeBook",this,function(a){var b=this;this.has(a)&&req("/book/"+a,"DELETE").send().then(function(){_.remove(b.cells,["id",a]),µ.one("#nbBooks").text=b.cells.length})["catch"](function(a){err.add(a)})}),em.on("filtreCollection",this,function(){_.forEach(this.cells,function(a){return a.filter()})}),em.on("filtreTag",this,function(a){window.scrollTo(0,0),µ.one("#selectedTag span").text=a,µ.one("#selectedTag").toggleClass("notdisplayed",!1),_.forEach(this.cells,function(a){return a.filter()}),em.emit("orderByTag",a,this.cells)}),em.on("fromCollection",this,this.get)};return Reflect.defineProperty(b.prototype,"length",{get:function(){return this.cells.length}}),b.prototype.add=function(a){if(_.find(this.cells,["id",a]))throw new Error("Book already added.");return _.push(this.cells,{id:a}),this},b.prototype.get=function(a){return _.find(this.cells,["id",a])},b.prototype.has=function(a){return _.some(this.cells,["id",a])},b.prototype.init=function(){var b=this;return req("/collection").send().then(function(c){µ.many(".waiting, .roundIcon").toggleClass("notdisplayed",!0),b.tags=_.map(c.books,function(a){return{id:a.id,tags:a.tags||[]}}),b.cells=_.union(b.cells,a.getCells(c.books,!0)),b.show(),c.total===b.cells.length&&(µ.one(".waitAnim").toggleClass("notdisplayed",!0),µ.one("#nbBooks").text=b.cells.length),em.emit("generateTags",b.tags)})["catch"](function(a){err.add(a)}),this},b.prototype.remove=function(a){var b=_.isNumber(a)?a:_.indexOf(this.cells,["id",a]);if(-1===b)throw new Error("Invalid book id.");return this.cells.splice(b,1),this},b.prototype.show=function(){return em.emit("clickMenu","collection"),em.emit("resetFilter",!_.isEmpty(this.tags)),em.emit("resetCells"),em.emit("showCells",this.cells),this},new b}),define("context",[],function(a){var b=function(){var b=this;this.context=µ.one("context").set("innerHTML",a),window.addEventListener("contextmenu",function(a){return a.preventDefault(),b.open(a),!1}),window.addEventListener("click",function(a){return b.close(),!0})};return b.prototype.close=function(){return this.context.toggleClass("notdisplayed",!0),this},b.prototype.open=function(a){this.context.toggleClass("notdisplayed",!1);var b=this.context.get("clientHeight"),c=this.context.get("clientWidth"),d=a.clientX,e=a.clientY;return this.context.css({top:e+b>window.innerHeight?e-b:e,left:d+c>window.innerWidth?d-c:d}),this},new b}),define("detail",["Window","hdb","text!../templates/detail","text!../templates/newDetail","text!../templates/Tag","text!../templates/MostAdded","text!../templates/Preview","text!../templates/Context"],function(a,b,c,d,e,f,g,h){var i=b.compile(c),j=b.compile(d),k=b.compile(e),l=b.compile(f),m=b.compile(h),n=new ColorThief,o=µ.one("detail"),p=function(){var a=this;em.on("openDetail",this,function(b){if(µ.one(".waiting").toggleClass("notdisplayed",!1),µ.one("html").toggleClass("overflown",!0),_.isPlainObject(b.book.id)&&_.isUndefined(b.book.id.number))a.empty(b);else if(b.book.detailed||b.book.inCollection)a.init(b);else{var c=store.get(b.id);c?(_.assign(b.book,c),a.init(b)):req("/detail/"+b.id).send().then(function(c){_.assign(b.book,c,{detailed:!0}),store.set(b.id,b.book),a.init(b)})["catch"](function(a){err.add(a)})}})},q=µ.one("context"),r=new a("preview",g);return p.prototype.add=function(){return this.cell.add(),µ.many("#detailAdd, #detailSave, #detailRecommand, #contextAdd, #contextSave, #contextRecommand, detail .inCollection").toggleClass("notdisplayed"),this},p.prototype.addTag=function(a){var b=this;if(!_.includes(this.detailBook.tags,a.tag)){var c=o.one(".tags"),d=µ["new"]("div").toggleClass("tag").set("innerHTML",k(a));d.one("button:not(.libelle)").observe("click",function(a){b.removeTag(a.element)}),c.append(_.sortBy(_.concat(o.many(".tags .tag").elements,[d]),[function(a){return a.one(".libelle").text}])).toggleClass("notdisplayed",!1),this.detailBook.tags=_.concat(this.detailBook.tags,[a.tag]),this.detailBook.tags.sort()}return this},p.prototype.byTag=function(a){return this.close(),µ.one("#collection").hasClass("active")||em.emit("showCollection"),em.emit("filtreTag",a),this},p.prototype.close=function(){return q.toggleClass("notdisplayed",!0),o.toggleClass("notdisplayed",!0),µ.one(".waiting").toggleClass("notdisplayed",!0),µ.one("html").toggleClass("overflown",!1),o.set("innerHTML",""),this},p.prototype.connex=function(){return this.close(),em.emit("associated",this.cell.id),this},p.prototype.create=function(){var a=this,b=o.one("form[name=newBook]").parser();return o.one("form[name=newBook]").reset(),req("/detail","POST").send(b).then(function(c){_.assign(b,{id:c}),a.cell.id=JSON.stringify(c),a.cell.add(),o.set("innerHTML",j(_.assign(a.detailBook,b,{inCollection:!0}))),a.setEvents()})["catch"](function(a){return err.add(a)}),this},p.prototype.empty=function(a){var b=this;this.cell=a,this.detailBook={note:0,tags:[],comment:""},o.set("innerHTML",j()),this.setEvents(),o.many("button.title").toggleClass("hide",!0),o.many(".volumeInfo input, .volumeInfo textarea, .volumeInfo span").toggleClass("notdisplayed"),µ.many("#detailAdd, #contextAdd").observe("click",function(){return b.create()}),o.one("[focus]").focus()},p.prototype.googleLink=function(){return window.open(this.detailBook.link),this},p.prototype.init=function(a){var b=this;req("/mostAdded/"+a.id).send().then(function(a){return b.mostAdded(a)})["catch"](function(a){return err.add(a)}),this.cell=a,this.detailBook=_.assign({note:0,tags:[],comment:""},this.cell.book),_.isPlainObject(a.book.id)?o.set("innerHTML",j(_.merge(this.detailBook,{src:this.cell.src}))):o.set("innerHTML",i(_.merge(this.detailBook,{src:this.cell.src}))),q.set("innerHTML",m(_.merge(this.detailBook,{src:this.cell.src}))).many("[nav]").observe("click",function(a){var c=a.element.get("nav"),d=µ.many("cell:not(.notdisplayed)"),e=~~(µ.one("bookcells").get("clientWidth")/b.cell.cell.get("clientWidth")),f=d.indexOf("[book='"+b.cell.id+"']");if(-1===f)return!1;switch(c){case"right":if(f+=1,f>=d.length)return!1;break;case"left":if(0===f)return!1;f-=1;break;case"top":if(e>f)return!1;f-=e;break;case"bottom":if(f+=e,f>=d.length)return!1}return setTimeout(function(){var a=d.get(f);window.scrollTo(0,a.get("offsetTop")),a.trigger("click")}),!0}),this.setEvents(),µ.many("#detailAdd, #contextAdd").observe("click",function(){return b.add()})},p.prototype.mostAdded=function(a){if(a.length){var b=o.one("#mostAdded"),c=b.one("div");b.many("*").toggleClass("notdisplayed",!1),_.forEach(a,function(a){var b=µ["new"]("div").toggleClass("mostAdded").set("innerHTML",l(a)).appendTo(c);if(a.description){var d=200,e=_.get(a,"description").indexOf(" ",d);b.one("span").html=_.get(a,"description").substr(0,Math.max(d,e))+(-1===e?"":"..."),b.one("span").observe("click",function(a){a.stopPropagation(),a.element.toggleClass("notdisplayed",!0)}),b.observe("mouseleave",function(){b.one("span").toggleClass("notdisplayed",!1)})}if(a.cover){var f=b.one("img");a.src="/cover/"+a.id+"?"+Math.random().toString(24).slice(2),f.loaded=function(){b.one(".altCover").remove(),f.toggleClass("notdisplayed",!1)},f.set("src",a.src)}b.observe("click",function(){em.emit("openDetail",em.emit("getCell",a,!1))})})}},p.prototype.preview=function(){q.toggleClass("notdisplayed",!0),µ.one(".waiting").toggleClass("over",!0),r.one("iframe").set("src","about:blank"),r.openOver(),o.one("form[target=preview]").trigger("submit")},p.prototype.recommand=function(){return _.noop(),this},p.prototype.removeTag=function(a){var b=a.siblings.get(0).text;return b&&(this.detailBook.tags=_.without(this.detailBook.tags,b),a.parent.remove()),this},p.prototype.save=function(){var a=this,b=_.omit(_.diff(this.detailBook,this.cell.book),["src","palette"]);return _.isEmpty(b)||req("/detail/"+this.cell.id,"PUT").send(b).then(function(){a.cell.update(a.detailBook,!0).defLoad(),_.has(b,"tags")&&em.emit("updateTag",{id:a.cell.id,tags:b.tags})})["catch"](function(a){return err.add(a)}),this.close(),this},p.prototype.setEvents=function(){var a=this;if(µ.many("detail .closeWindow, context #contextClose").observe("click",function(){return a.close()}),µ.many("#detailSave, #contextSave").observe("click",function(){return a.save()}),µ.many("#detailGbooks, #contextGbooks").observe("click",function(){return a.googleLink()}),µ.many("#detailConnex, #contextConnex").observe("click",function(){return a.connex()}),µ.many("#detailPreview, #contextPreview").observe("click",function(){return a.preview()}),µ.many("#detailRecommand, #contextRecommand").observe("click",function(){return a.recommand()}),o.toggleClass("notdisplayed",!1),o.one("form[name=formTag]").observe("submit",function(b){b.preventDefault(),a.addTag(b.element.parser()),b.element.reset()}),this.detailBook.inCollection&&o.many(".inCollection").toggleClass("notdisplayed",!1),this.detailBook.note){var b=o.many(".note");b.length=this.detailBook.note,b.toggleClass("empty select")}o.css("background","radial-gradient(circle at 50%, whitesmoke 0%, #909090 100%)"),o.many(".note").observe("mouseenter",function(b){var c=_.parseInt(b.element.get("note")),d=a.detailBook.note,e=o.many(".note");e.each(function(a,b){a.toggleClass("plus",b>=d&&c>b).toggleClass("minus",d>b&&b>=c)})}).observe("mouseleave",function(){o.many(".note").each(function(a){a.toggleClass("plus minus",!1)})}).observe("click",function(b){var c=_.parseInt(b.element.get("note"));1===a.detailBook.note&&1===c?a.detailBook.note=0:a.detailBook.note=c,o.many(".note").each(function(b,c){b.toggleClass("empty",c>=a.detailBook.note).toggleClass("select",c<a.detailBook.note)})}),o.one("[name=userComment]").observe("change",function(b){a.detailBook.comment=b.element.value,a.detailBook.date=b.element.value?new Date:null}),o.one("#detailCover").observe("load",function(){a.detailBook.palette=n.getPalette(o.one("#detailCover").element),a.detailBook.palette&&a.detailBook.palette.length&&o.css("background","radial-gradient(circle at 50%, whitesmoke 0%,"+µ.rgbToHex(a.detailBook.palette[0])+" 100%)")}),o.one("div.upload").observe("click",function(){return o.one("[type=file]").trigger("click")}),o.one("[type=file]").observe("change",function(b){if(o.many("#noCover").toggleClass("notdisplayed",b.element.files.length),b.element.files.length){var c=new FileReader;c.addEventListener("load",function(b){o.one("#detailCover").toggleClass("notdisplayed",!1).set("src",b.target.result),a.detailBook.alt=b.target.result}),c.readAsDataURL(b.element.files[0]),o.one("form[name=uploadImg]").reset()}}),o.one("datalist").html=em.emit("getCloudOptions").join(""),o.many("[searchby]").observe("click",function(b){a.close(),em.emit("search",{by:b.element.get("searchby"),search:b.element.text,lang:document.body.lang})}),o.many(".tag button").observe("click",function(b){b.element.hasClass("libelle")?a.byTag(b.element.text):a.removeTag(b.element)}),o.one("[name=newBook]").observe("submit",function(a){return a.preventDefault()}),o.many(".volumeInfo input, .volumeInfo textarea").observe("blur",function(b){b.element.value=""+b.element.value.substr(0,1).toUpperCase()+b.element.value.substr(1),_.set(a.detailBook,"volumeInfo."+b.element.name,b.element.value)}),o.many("button.title").observe("click",function(a){a.element.toggleClass("hide"),a.element.parent.many("input, textarea").toggleClass("notdisplayed")}),em.on("resize",this,this.close),em.on("closeAll",this,this.close)},r.one("#closePreview").observe("click",function(){µ.one(".waiting").toggleClass("over",!1),r.closeOver()}),o.observe("contextmenu",function(a){a.preventDefault();var b=q.toggleClass("notdisplayed",!1).get("clientHeight"),c=q.get("clientWidth"),d=a.clientX,e=a.clientY;return q.css({top:e+b>window.innerHeight?e-b:e,left:d+c>window.innerWidth?d-c:d}),!1}),o.observe("click",function(){return q.toggleClass("notdisplayed",!0)}),new p}),define("firebase",["json!../config-firebase.json"],function(a){firebase.initializeApp(a);var b=firebase.messaging();b.requestPermission().then(function(){return b.getToken()}).then(function(a){})["catch"](function(a){return err.add(a)})}),define("footer",[],function(){var a=function(){if(!µ.one("detail").visible)var a=setInterval(function(){var b=(document.body.scrollTop/2-.1).toFixed(1);window.scroll(0,b),.1>=b&&(window.scroll(0,0),clearInterval(a))},100)};µ.one(window).observe("scroll",function(){return µ.one("#footer").toggleClass("notdisplayed",!document.body.scrollTop)}),µ.one("#footer").observe("click",a),em.on("toTop",a)}),define("menu",["Window","text!../templates/menu","text!../templates/contacts","text!../templates/help","text!../templates/sorts"],function(a,b,c,d,e){var f=µ.one("navbar").set("innerHTML",b).toggleClass("notdisplayed"),g=µ.one("sorts").set("innerHTML",e),h=new a("contacts",c).set("id","contactsWindow"),i=new a("help",d),j=function(){f.many(".navbar").toggleClass("notdisplayed"),µ.one("bookcells").css("top",µ.one("#navbar").get("clientHeight")||0)},k="";µ.one("bookcells").css("top",µ.one("#navbar").get("clientHeight")),f.hide=function(){f.one("#navbar").toggleClass("transparent",!0),µ.one("bookcells").css("top",0),g.toggleClass("notdisplayed",!0)},f.timeout=setTimeout(f.hide,5e3),f.many("#affichToggle, #altNavbar").observe("click",j),em.on("logout",function(){store.clear(),req("/logout").send().then(function(){window.location.reload("/")})}),f.one("#logout").observe("click",function(){em.emit("logout")}),f.one("#recherche").observe("click",function(){return em.emit("openSearch")}),f.one("#profile").observe("click",function(){return em.emit("openProfile")}),f.one("#collection").observe("click",function(){em.emit("defaultSort"),em.emit("showCollection")}),f.one("#tags").observe("click",function(){return em.emit("openCloud")}),f.one("#saveorder").observe("click",function(){return em.emit("saveOrder")}),f.one("#newbook").observe("click",function(){return em.emit("newBook")}),em.on("clickMenu",function(a){_.isString(a)&&(f.many(".active").toggleClass("active",!1),f.one("#"+a).toggleClass("active",!0),µ.one("#saveorder").toggleClass("notdisplayed",!0),k="")}),f.one("form").observe("submit",function(a){return a.preventDefault()}),f.one("[type=search]").observe("search",function(a){a.preventDefault();var b=this.value;return this.valid&&b!==k&&(k=b,f.one("#selectedSearch span").text=k,f.one("#selectedSearch").toggleClass("notdisplayed",!k),em.emit(f.one("#collection").hasClass("active")?"filtreCollection":"filtreSearch")),!1}),em.on("resetFilter",function(a){f.one("#selectedTag span").text=f.one("#selectedSearch span").text="",f.many("#selectedTag, #selectedSearch").toggleClass("notdisplayed",!0),f.one("#tags").toggleClass("notdisplayed",!a),f.one("form").reset()}),f.one("#contact").observe("click",function(){return h.open()}),h.many("[url]").observe("click",function(a){return window.open(a.element.get("url"))}),h.one("#helpLink").observe("click",function(a){h.close(),i.open()}),h.one("#mailLink").observe("click",function(a){return a.element.one("a").trigger("click")}),f.one("#tris").observe("click",function(a){g.css({top:µ.one("#navbar").get("clientHeight"),left:this.element.offsetLeft}).toggleClass("notdisplayed")}).observe("mouseover",function(){return g.toggleClass("onTris",!0)}).observe("mouseleave",function(){return g.toggleClass("onTris",!1)}),g.many("div").observe("click",function(){f.one("#tris").trigger("click"),em.emit("cellsSort",this.get("by"),this.get("sort")),g.many("div").toggleClass("sortBy",!1),this.toggleClass("sortBy",!0)}),em.on("resetSort",function(){return g.one(".sortBy").toggleClass("sortBy",!1)}),em.on("defaultSort",function(){g.one(".sortBy").toggleClass("sortBy",!1),g.many("div").get(0).toggleClass("sortBy",!0)}),g.observe("mouseover",function(){g.timeout&&clearTimeout(g.timeout)}).observe("mouseleave",function(){g.timeout=setTimeout(function(){g.toggleClass("notdisplayed",!0)},1e3)}),window.addEventListener("selectstart",function(a){return _.includes(["INPUT","TEXTAREA"],_.toUpper(a.target.tagName))?!0:a.preventDefault()&&!1}),window.addEventListener("keyup",function(a){var b=!1;if(!a.ctrlKey)if(a.altKey)if(_.includes([66,69,72,73,76,77,80,82,84],a.keyCode)&&µ.one(".waitAnim").visible)b=!0;else switch(a.keyCode){case 66:em.emit("showCollection"),b=!0;break;case 69:em.emit("openCloud"),b=!0;break;case 72:i.open(),b=!0;break;case 73:h.open(),b=!0;break;case 76:em.emit("logout");break;case 77:j(),b=!0;break;case 80:em.emit("openProfile"),b=!0;break;case 82:em.emit("openSearch"),b=!0;break;case 84:em.emit("toTop"),b=!0}else if(27===a.keyCode)em.emit(µ.one(".over").visible?"closeOver":"closeAll"),b=!0;else if(8!==a.keyCode||_.includes(["INPUT","TEXTAREA"],_.toUpper(a.target.tagName))){if(µ.one("detail").visible&&_.includes([37,38,39,40],a.keyCode)){var c=µ.one("context"),d="";switch(a.keyCode){case 37:d="left";break;case 38:d="top";break;case 39:d="right";break;case 40:d="bottom"}c.one("[nav="+d+"]").trigger("click")}}else b=!0;return b&&a.preventDefault(),!b}),f.observe("mouseover",function(a){_.has(f,"timeout")&&clearTimeout(f.timeout);var b=a.element.one("#navbar");b.toggleClass("transparent",!1),µ.one("bookcells").css("top",b.get("clientHeight"))}).observe("mouseleave",function(a){f.timeout=setTimeout(f.hide,2500)}),window.addEventListener("contextmenu",function(a){return a.preventDefault(),!1}),window.addEventListener("click",function(a){"tris"!==a.target.id&&setTimeout(function(){return g.toggleClass("notdisplayed",!0)})})}),define("profile",["Window","hdb","text!../templates/profile"],function(a,b,c){var d=b.compile(c),e=function(){var b=this;em.on("openProfile",function(){b.window.open()}),em.on("getUser",function(){return b.user._id}),em.once("init",this,function(){var b=this;req("/profile").send().then(function(c){b.user=c,b.window=new a("profile",d(c)),µ.one("#recommand4u").toggleClass("notdisplayed",!c.googleSignIn),b.window.many(".googleSignIn").toggleClass("notdisplayed",!c.googleSignIn),b.window.one("#googleSignIn").set("checked",c.googleSignIn||!1),b.window.one("input[name=googleSync]").set("checked",c.googleSync,!1),b.window.one("form").observe("submit",function(a){a.preventDefault();var b=a.element.parser();_.forIn(b,function(a,d){_.get(c,d)===a&&(b=_.omit(b,d))}),_.isEmpty(b)||req("/profile","PUT").send(b).then(function(){_.assign(c,b)})["catch"](function(a){return err.add(a)})}),b.window.one("#delete").observe("click",function(a){var c=b.window.one("form").parser();_.get(c,"pwd")?req("/profile","DELETE").send(c).then(function(){return window.location.reload(!0)})["catch"](function(a){return err.add(a)}):b.window.one("input[name=pwd]").set("required",!0)})})}),em.on("updateOrder",this,this.updateOrder),em.on("orderByTag",this,this.orderByTag)};return e.prototype.orderByTag=function(a,b){var c=_.find(this.user.orders,["tag",a]),d=µ.one("bookcells");c&&_.forEachRight(c.list,function(a){var c=_.find(b,["id",a]);_.has(c,"cell")&&d.insertFirst(c.cell)})},e.prototype.updateOrder=function(a){var b=this,c=_.find(this.user.orders,["tag",a.tag]);req("/order",c?"PUT":"POST").send(a).then(function(){c?_.assign(c,a):b.user.orders.push(a)})["catch"](function(a){return err.add(a)})},new e}),define("search",["collection","Window","text!../templates/search"],function(a,b,c){var d=function(){var a=this;this.last={},this.window=new b("search",c),em.on("openSearch",function(){a.window.one("form").reset(),a.window.open()}),em.on("filtreSearch",this,function(){_.forEach(this.last.cells,function(a){return a.filter()})}),em.on("associated",function(b){em.emit("cellsReset"),_.get(a.last,"qs.associated")!==b?(a.last={qs:{associated:b}},a.last.books=[],a.associated()):em.emit("cellsShow",a.last.cells)}),em.on("search",this,function(b){_.isEqual(b,a.last.qs)?(em.emit("cellsReset"),em.emit("cellsShow",a.last.cells)):(a.last.qs=b,a.last.books=[],a.last.cells=[],em.emit("cellsReset"),µ.many(".waiting, .roundIcon, .waitAnim").toggleClass("notdisplayed",!1),µ.one("sort.active").toggleClass("active",!1),em.emit("resetFilter"),em.emit("clickMenu","recherche"),a.get(b))}),µ.one("form[name=searchForm]").observe("submit",function(b){b.preventDefault();var c=b.element.parser();return _.isEqual(c,a.last.qs)||(a.window.close(),µ.many(".waiting, .roundIcon, .waitAnim").toggleClass("notdisplayed",!1),µ.one("sort.active").toggleClass("active",!1),a.last.qs=c,a.last.books=[],a.last.cells=[],em.emit("cellsReset"),a.get(c),b.element.reset(),em.emit("resetFilter"),em.emit("clickMenu","recherche")),!1})};return d.prototype.associated=function(){var a=this;µ.many(".waiting, .roundIcon, .waitAnim").toggleClass("notdisplayed",!1),µ.one("sort.active").toggleClass("active",!1),em.emit("resetFilter"),em.emit("clickMenu","recherche");var b=store.get(this.last.qs);return b?(this.show(b),µ.one(".waitAnim").toggleClass("notdisplayed",!0)):req("/associated/"+this.last.qs.associated).send().then(function(b){a.show(b.books),µ.one(".waitAnim").toggleClass("notdisplayed",!0),store.set(a.last.qs,b.books)})["catch"](function(a){return err.add(a)}),this},d.prototype.get=function(){var a=store.get(this.last.qs);return a?(this.show(a),µ.one(".waitAnim").toggleClass("notdisplayed",!0)):this.request(),this},d.prototype.recommanded=function(){var a=this;if(this.window.close(),_.isEqual("recommanded",this.last.qs))em.emit("cellsReset"),em.emit("cellsShow",this.last.cells);else{this.last.qs="recommanded";var b=store.get(this.last.qs);b?(this.show(b),µ.one(".waitAnim").toggleClass("notdisplayed",!0)):req("/recommanded","POST").send().then(function(b){a.show(b),store.set(a.last.qs,b)})["catch"](function(a){err.add(a)})}return this},d.prototype.request=function(){var a=this;req("/search").send(_.merge({},this.last.qs,{index:this.last.books.length})).then(function(b){return a.show(b.books),40===b.books.length&&a.last.books.length<400?a.request():(µ.one(".waitAnim").toggleClass("notdisplayed",!0),store.set(a.last.qs,a.last.books)),!1})["catch"](function(a){err.add(a)})},d.prototype.show=function(a){this.last.books=_.unionBy(this.last.books,a,"id");var b=_.map(a,function(a){return em.emit("getCell",a)});return this.last.cells=_.unionBy(this.last.cells,b,"id"),µ.many(".waiting, .roundIcon").toggleClass("notdisplayed",!0),
em.emit("cellsShow",b),this},new d}),define("Window",[],function(){var a=function b(a){var c=this,d=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"";return this instanceof b?(this.selector=a,this.template=d,this.window=µ.one(a).set("innerHTML",d),this.window.one(".closeWindow").observe("click",function(){return c.close()}),em.on("resize",this,this.closeAll),em.on("closeAll",this,this.closeAll),em.on("closeOver",this,this.closeOver),this):new b(a,d)};return a.prototype.close=function(){return this.window.toggleClass("notdisplayed",!0),µ.one(".waiting").toggleClass("notdisplayed",!0),µ.one("html").toggleClass("overflown",!1),em.emit(this,"close"),this},a.prototype.closeAll=function(){return this.close().closeOver()},a.prototype.closeOver=function(){return this.window.toggleClass("notdisplayed",!0),µ.one(".waiting").toggleClass("over",!1),em.emit(this,"closeOver"),this},a.prototype.many=function(a){return this.window.many(a)},a.prototype.one=function(a){return this.window.one(a)},a.prototype.open=function(){return this.window.css({top:"10px"}),this.window.toggleClass("notdisplayed",!1).one("[focus]").focus(),µ.one(".waiting").toggleClass("notdisplayed",!1),µ.one("html").toggleClass("overflown",!0),em.emit(this,"open"),this},a.prototype.openOver=function(){return this.window.toggleClass("notdisplayed",!1).one("[focus]").focus(),µ.one(".waiting").toggleClass("over",!0),em.emit(this,"openOver"),this},a.prototype.set=function(){var a;return(a=this.window).set.apply(a,arguments),this},a.prototype.toggle=function(){return this.window.hasClass("notdisplayed")?this.open():this.close()},a});