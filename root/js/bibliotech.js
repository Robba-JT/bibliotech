if(window.FileReader&&"formNoValidate"in document.createElement("input")){var start=new Date,app=angular.module("bibliotech",["preloader","socket","idb","defcloak","navbar","search","profile","bookcells","detail"]);app.config(["$interpolateProvider","$sceProvider",function(a,b,c){"use strict";a.startSymbol("[{"),a.endSymbol("}]"),b.enabled(!1)}]),app.run(["$rootScope","$http","$window","$timeout","$socket","$idb",function(a,b,c,d,e,f){"use strict";b.get(["trads",document.documentElement.lang||"fr","bibliotech.json"].join("/")).then(function(b){a.trads=b.data}),a.waiting={screen:!0,over:!1,icon:!0,anim:!0},a.windows={opened:{},top:0,close:function(b){"*"===b?this.opened={}:delete this.opened[b],_.assign(a.waiting,{screen:!_.isEmpty(this.opened),over:!1})},open:function(b,c){c&&this.close("*"),this.opened[b]=this.xcroll().top+10,"sort"!==b&&"notifs"!==b&&_.assign(a.waiting,{screen:!0,over:_.keys(this.opened).length>1})},xcroll:function(){return{top:c.scrollY||document.documentElement.scrollTop,left:c.scrollX||document.documentElement.scrollLeft}}};var g=function(a){document.one("#noConnect").css({top:noConnect.clientHeight+a.clientY>window.innerHeight?a.clientY-noConnect.clientHeight:a.clientY,left:noConnect.clientWidth+a.clientX>window.innerWidth?a.clientX-noConnect.clientWidth:a.clientX})};e.connect(function(){_.assign(a.waiting,{connect:!1}),document.removeEventListener("mousemove",g)}),e.disconnect(function(){a.windows.close("*"),a.bookcells.reset(),delete a.bookcells.collection,angular.element(document).bind("mousemove",g),d(function(){_.assign(a.waiting,{connect:!0})},2e3),a.$apply()}),a.logout=function(){return a.waiting.screen=!0,f.indexedDB&&f.indexedDB.deleteDatabase(a.profile.user.session),a.profile.user={},c.location.assign("/logout"),e.close(),!1},angular.element(c).bind("selectstart",function(a){return a.preventDefault(),a.target.tagName&&!_.includes(["input","textarea"],a.target.tagName.toLowerCase())?!1:void 0}).bind("contextmenu",function(a){return a.preventDefault(),!1}).bind("resize",function(){d(function(){a.bookcells.width=~~(document.one("[bookcells]").clientWidth/~~(document.one("[bookcells]").clientWidth/256))-~~(document.one("[bookcells]").clientWidth/256)+"px",a.bookcells.iwidth=~~(document.one("[bookcells]").clientWidth/~~(document.one("[bookcells]").clientWidth/256))-~~(document.one("[bookcells]").clientWidth/256)-20+"px",a.windows.close("*"),a.tags.reset()}).then(function(){a.navbar.height=document.one("#navbar").clientHeight})}).bind("scroll",function(){a.$apply(a.footer=!!a.windows.xcroll().top)}).bind("click",function(b){a.modal.navBottom=document.one("#navbar").clientHeight+5,a.modal.sortLeft=document.one("#tris").offsetLeft,a.modal.notifsLeft=document.one("#notifications").offsetLeft,"tris"!==b.target.id&&(a.modal.sort=!1),"notifications"!==b.target.id&&(a.modal.notifs=!1),b.target.getAttribute("nav")||(a.context.show=!1),a.$apply()}).bind("keypress, keydown",function(b){b=b||window.event;var c;if(!b.altKey){if(b.ctrlKey)if(-1!==[77,76,82,80,66,69,73,72].indexOf(b.keyCode)&&a.waiting.anim)c=!0;else switch(b.keyCode){case 77:a.navbar.toggleMenu(),c=!0;break;case 76:a.logout(),c=!0;break;case 82:a.windows.open("search",!0),c=!0;break;case 80:a.windows.open("profile",!0),c=!0;break;case 66:a.navbar.collection(),c=!0;break;case 69:a.tags.show(),c=!0;break;case 73:a.windows.open("contacts",!0),c=!0;break;case 72:a.windows.open("help",!0),c=!0}else 8===b.keyCode&&-1===["INPUT","TEXTAREA"].indexOf(b.target.nodeName)?c=!0:27===b.keyCode&&(a.windows.close("*"),c=!0);if(c)return b.preventDefault(),a.$apply(),!1}}),angular.element(document.one("#footer")).bind("click",function(){var b=setInterval(function(){var d=(a.windows.xcroll().top/2-.1).toFixed(1);c.scroll(0,d),.1>=d&&(c.scroll(0,0),clearInterval(b))},100)})}]),app.factory("$thief",function(){"use strict";return{getColor:(new ColorThief).getColor,getPalette:(new ColorThief).getPalette}}),app.directive("drag",["$rootScope",function(a){"use strict";var b=function(a,b,c){b.addClass(c),a.dataTransfer.setData("id",a.target.id),a.dataTransfer.effectAllowed="move"},c=function(a,b,c){b.removeClass(c)};return{restrict:"A",link:function(d,e,f){f.$set("draggable","true"),d.dragData=d[f.drag],d.dragStyle=f.dragstyle,e.on("dragstart",function(c){a.draggedElement=d.dragData,b(c,e,d.dragStyle)}),e.bind("dragend",function(a){c(a,e,d.dragStyle)})}}}]),app.directive("drop",["$rootScope",function(a){"use strict";var b=function(a,b,c){a.preventDefault(),b.addClass(c)},c=function(a,b,c){b.removeClass(c)},d=function(a){a.preventDefault()},e=function(a,b,c){a.preventDefault(),b.removeClass(c)};return{restrict:"A",link:function(f,g,h){f.dropData=f[h.drop],f.dropStyle=h.dropstyle,g.bind("dragenter",function(a){b(a,g,f.dropStyle)}),g.bind("dragleave",function(a){c(a,g,f.dropStyle)}),g.bind("dragover",d),g.bind("drop",function(b){e(b,g,f.dropStyle),a.$broadcast("dropEvent",a.draggedElement,f.dropData)})}}}]),app.directive("compareTo",["$rootScope",function(a){"use strict";return{restrict:"A",require:"ngModel",scope:{otherModelValue:"=compareTo",notEquals:"@"},link:function(a,b,c,d){d.$validators.compareTo=function(b){return a.notEquals?b!==a.otherModelValue:b===a.otherModelValue},a.$watch("otherModelValue",function(){d.$validate()})}}}]),app.directive("message",["$rootScope","$window",function(a,b){"use strict";return{restrict:"A",scope:{message:"@",titre:"@",callback:"=callback"},link:function(c,d,e){d.on("click",function(){var d=a.confirm={};d.titre=a.trads[c.titre],d.message=a.trads[c.message],d.callback=c.callback,d.top=a.windows.xcroll().top+b.innerHeight/4,d.left=b.innerWidth/4,a.windows.open("confirm")})}}}]),app.directive("autoFocus",["$timeout",function(a){"use strict";return{restrict:"A",link:function(b,c,d){b.$watch(d.autoFocus,function(b){a(function(){b&&c[0].focus()})})}}}]),app.directive("description",["$timeout",function(a){"use strict";return{restrict:"A",link:function(b,c,d){var e=function(c){if(this.one(".description")||b.noShow)return void delete b.noShow;if(b.cell.description){var d=this,e=b.cell.description.indexOf(" ",500),g=b.cell.title,h=b.cell.description.substr(0,Math.max(e,500))+(-1!==e?"...":""),i=d.clientWidth,j=d.clientHeight,k=Math.max(window.innerHeight,document.one("[bookcells]").clientHeight)-d.yposition()<j?-(j/3).toFixed(0):(j/3).toFixed(0),l=window.innerWidth-(d.xposition()+i)<i?-(i/3).toFixed(0):(i/3).toFixed(0),m="top: "+k+"px; left: "+l+"px; width: "+i+"px;",n=angular.element('<div class="description notdisplayed" style="'+m+'"><span>'+g+"</span><div>"+h+"</div></div>");angular.element(d).append(n),a(function(){n&&(n.toggleClass("notdisplayed",!1),n.on("click",function(){b.noShow=!0,f.call(d)}))},1e3)}},f=function(a){this.one(".description")&&this.removeChild(this.one(".description"))};c.on("mouseover",e),c.on("mouseleave",f)}}}])}else document.getElementsByClassName("roundIcon")[0].style.display=document.getElementsByClassName("waiting")[0].style.display=document.getElementsByClassName("waitAnim")[0].style.display="none";!function(){"use strict";var a=angular.module("preloader",[]);a.factory("$preloader",["$q","$rootScope",function(a,b){var c=function(b){this.imageLocations=b,this.imageCount=this.imageLocations.length,this.loadCount=0,this.errorCount=0,this.states={PENDING:1,LOADING:2,RESOLVED:3,REJECTED:4},this.state=this.states.PENDING,this.deferred=a.defer(),this.promise=this.deferred.promise};return c.preloadImages=function(a){Array.isArray(a)||(a=[a]);var b=new c(a);return b.load()},c.prototype={constructor:c,isInitiated:function(){return this.state!==this.states.PENDING},isRejected:function(){return this.state===this.states.REJECTED},isResolved:function(){return this.state===this.states.RESOLVED},load:function(){if(this.isInitiated())return this.promise;this.state=this.states.LOADING;for(var a=0;a<this.imageCount;a++)this.loadImageLocation(this.imageLocations[a]);return this.promise},handleImageError:function(a){this.errorCount++,this.isRejected()||(this.state=this.states.REJECTED,this.deferred.reject(a))},handleImageLoad:function(a){this.loadCount++,this.isRejected()||(this.deferred.notify({percent:Math.ceil(this.loadCount/this.imageCount*100),imageLocation:a}),this.loadCount===this.imageCount&&(this.state=this.states.RESOLVED,this.deferred.resolve(this.imageLocations)))},loadImageLocation:function(a){var c=this,d=new Image;d.onload=function(a){b.$apply(function(){c.handleImageLoad(a.target.src),c=d=a=null})},d.onerror=function(a){b.$apply(function(){c.handleImageError(a.target.src),c=d=a=null})},d.src=a.cover||a.alternative||a}},c}])}(),function(){"use strict";var a=angular.module("socket",[]);a.factory("$socket",["$rootScope","$timeout",function(a,b){var c={on:[],emit:[]},d=function(){var b=function(b,c){f.on(b,function(){var b=arguments;a.$apply(function(){c.apply(f,b)})})},d=function(){if(!document.body.getAttribute("page"))return location.assign("/logout");var d=io.connect("/"+document.body.getAttribute("page"),{secure:!0,multiplex:!1});return d.on("error",function(b){a.logout()}).once("connect",function(){this.emit("isConnected"),start=new Date,_.isFunction(c.connect)&&c.connect.apply(),this.once("disconnect",function(a){e(this),_.isFunction(c.disconnect)&&c.disconnect.apply()}),this.on("logout",a.logout);for(var d=0,g=c.on.length;g>d;d++)b(c.on[d].event,c.on[d].callback);for(d=0,g=c.emit.length;g>d;d++)f.emit(c.emit[d].event,c.emit[d].data);c.emit.length=0}),d},e=function(a){var b=setInterval(function(){a&&a.connected&&"open"===a.io.readyState&&(clearInterval(b),a.destroy(),f=d());try{a.connect()}catch(c){}},3e3)},f=d();return{on:function(a,d){f&&f.connected?b(a,d):c.on.push({event:a,callback:d})},connect:function(a){c.connect=a,f&&f.connected&&a.apply()},disconnect:function(a){c.disconnect=a,f&&f.connected&&f.once("disconnect",a)},emit:function(a,b){f&&f.connected?f.emit(a,b):c.emit.push({event:a,data:b})},close:function(){f.close()}}}();return d}])}(),function(){"use strict";var a=angular.module("idb",[]);a.factory("$idb",function(){return{deleteDetail:function(a){this.db&&this.db.transaction(["details"],"readwrite").objectStore("details")["delete"](a)},deleteQuery:function(a){this.db&&this.db.transaction(["queries"],"readwrite").objectStore("queries")["delete"](a)},getDetail:function(a){var b=this;return _.isPlainObject(a)&&(a=JSON.stringify(a)),new Promise(function(c){b.db||c();var d=b.db.transaction(["details"],"readwrite").objectStore("details").index("by_id").get(a);d.onsuccess=function(){this.result?c(this.result):c()},d.onerror=function(){c()}})},getQuery:function(a){var b=this;return new Promise(function(c,d){b.db||d();var e=b.db.transaction(["queries"],"readwrite").objectStore("queries").index("by_query").get(JSON.stringify(a));e.onsuccess=function(){this.result&&this.result.books&&this.result.books.length?c(this.result.books):d()},e.onerror=d})},init:function(a){var b=this;return this.indexedDB=window.indexedDB||window.mozIndexedDB||window.webkitIndexedDB||window.msIndexedDB,new Promise(function(c,d){if(b.indexedDB){var e=b.indexedDB.open(a,1);e.onerror=function(){d()},e.onsuccess=function(){b.db=this.result,c()},e.onupgradeneeded=function(){var a=this.result;a.createObjectStore("queries",{keyPath:"query"}).createIndex("by_query","query",{unique:!0}),a.createObjectStore("details",{keyPath:"id"}).createIndex("by_id","id",{unique:!0})}}})},setDetail:function(a){if(this.db){this.db.transaction(["details"],"readwrite").objectStore("details").put(a)}},setQuery:function(a,b){if(this.db){this.db.transaction(["queries"],"readwrite").objectStore("queries").put({query:JSON.stringify(a),books:b})}}}})}(),function(){"use strict";var a=angular.module("navbar",[]);a.directive("navbar",function(){return{restrict:"A",templateUrl:"./html/navbar.html",controller:["$socket","$scope","$window","$timeout",function(a,b,c,d){var e=b.navbar={},f=b.tags={cloud:!1},g=(b.modal={sort:!1,notifs:!1},b.notifs={}),h=function(){if(!this.hasClass("sortBy")){var a=this.getAttribute("by"),c=this.getAttribute("sort");b.bookcells.cells=_.sortByOrder(b.bookcells.cells,[a],"desc"!==c),b.$apply(),document.one(".sortBy")&&document.one(".sortBy").toggleClass("sortBy",!1),this.toggleClass("sortBy",!0)}};e.visible=!0,e.height=document.one("#navbar").clientHeight,e.newbook=function(){b.waiting.screen=!0,b.detail.show({})},e.openUrl=function(a){c.open(a)},e.mailTo=function(){document.location.href="mailto:admin@biblio.tech?subject=Bibliotech"},e.collection=function(){e.saveorder=!1,document.one(".sortBy")&&!document.one("#sort > div").hasClass("sortBy")&&document.one(".sortBy").toggleClass("sortBy",!1),document.one("#sort > div").toggleClass("sortBy",!0),c.scroll(0,0),e.isCollect?(e.filtre=e.last=b.search.last=b.tags.last=null,b.bookcells.cells=_.sortByOrder(b.bookcells.cells,"title"),_.forEach(b.bookcells.cells,function(a){_.assign(a,{toHide:!1,toFilter:!1})})):b.bookcells.reset().then(function(){d(function(){b.bookcells.cells=angular.copy(_.sortByOrder(b.bookcells.collection,"title")),e.isCollect=!0}).then(function(){_.assign(b.waiting,{screen:!1,icon:!1,anim:!1})})})},e.filter=function(){var a=this.filtre.toLowerCase().noAccent().noSpace().split(" ").sort(),c=a.length;_.isEqual(a,this.last)||(_.forEach(b.bookcells.cells,function(b){if(_.isEqual(a,[""]))return void(b.toFilter=!1);for(var d=(b.title+" "+(b.subtitle?b.subtitle:"")+" "+(b.authors?b.authors.join(", "):"")+" "+b.description).toLowerCase().noAccent().noSpace(),e=0;c>e;e++)if(-1===d.indexOf(a[e]))return void(b.toFilter=!0);b.toFilter=!1}),d(this.last=a))},e.toggleMenu=function(){d(this.visible=!this.visible).then(function(){e.height=document.one("#navbar").clientHeight})},e.saveOrder=function(){var c={id:b.tags.last,order:_.pluck(_.filter(b.bookcells.cells,function(a){return a.toHide===!1}),"id")},d=_.findIndex(b.profile.user.orders,_.matchesProperty("id",c.id));-1!==d?_.assign(b.profile.user.orders[d],{order:c.order}):(c["new"]=!0,b.profile.user.orders.push({id:c.id,order:c.order})),a.emit("orders",c),e.saveorder=!1},f.generate=function(){for(var a=document.one("#cloud"),c=~~(a.clientHeight/2),d=~~(a.clientWidth/2),e=d/c,f=3,g=[],h=function(a,b){for(var c=function(a,b){return Math.abs(2*a.offsetLeft+a.offsetWidth-2*b.offsetLeft-b.offsetWidth)<a.offsetWidth+b.offsetWidth&&Math.abs(2*a.offsetTop+a.offsetHeight-2*b.offsetTop-b.offsetHeight)<a.offsetHeight+b.offsetHeight},d=0,e=b.length;e>d;d++)if(c(a,b[d]))return!0;return!1},i=0,j=b.tags.tags.length;j>i;i++){var k=b.tags.tags[i],l=a.newElement("span",{title:k.weight,"class":"tag tag"+Math.min(~~(k.weight/5)+1,10)}).html(k.text),m=c-l.clientHeight/2,n=d-l.clientWidth/2,o=0,p=6.28*Math.random();for(l.css({top:m,left:n});h(l,g);)o+=f,p+=(i%2===0?1:-1)*f,m=c+o*Math.sin(p)-l.clientHeight/2,n=d-l.clientWidth/2+o*Math.cos(p)*e,l.css({top:m,left:n});g.push(l)}angular.element(a.alls("span")).bind("click",b.tags.click)},f.show=function(){new Promise(function(a){a(b.windows.open("cloud",!0))}).then(function(){document.alls("#cloud span").length||b.tags.generate()})},f.click=function(){b.windows.close("*"),f.search(this.html()),b.$apply()},f.search=function(a){b.tags.last=a,b.windows.close("*"),e.saveorder=!1,c.scroll(0,0),e.filtre=e.last="";for(var d=_.find(b.profile.user.orders,_.matchesProperty("id",a)),f=0,g=b.bookcells.cells.length;g>f;f++)_.assign(b.bookcells.cells[f],{toHide:!_.includes(b.bookcells.cells[f].tags,a),toFilter:!1});if(d&&d.order)for(d.order.reverse(),f=0,g=d.order.length;g>f;f++){var h=_.remove(b.bookcells.cells,_.matchesProperty("id",d.order[f]));h.length&&b.bookcells.cells.splice(0,0,h[0])}},f.init=function(){var a=_.countBy(_.flatten(_.compact(_.pluck(b.bookcells.collection,"tags")),!0).sort()),c=[];if(a){var d="";_.forEach(a,function(a,b){c.push({text:b,weight:a}),d+="<option>"+b+"</option>"}),document.one("#tagsList").html(d),this.tags=_.sortBy(c,"weight").reverse()}document.alls("#cloud span").removeAll()},f.reset=function(){document.alls("#cloud span").removeAll()},a.on("notifs",function(a){b.notifs.notifs=a}),g.show=function(b){a.emit("readNotif",_.pullAt(this.notifs,b)[0])},angular.element(document.alls("#sort > div")).bind("click",h)}]}})}(),function(){"use strict";var a=angular.module("profile",[]);a.directive("profile",function(){return{restrict:"A",templateUrl:"./html/profile.html",controller:["$scope","$socket","$idb","$preloader",function(a,b,c,d){var e=a.profile={};e.reset=function(){_.assign(this.user,{pwd:"",newPwd:"",confirmPwd:"",error:!1})},e.send=function(){b.emit("updateUser",this.user)},e["delete"]=function(){b.emit("deleteUser",this.user),a.windows.close("*")},e["import"]=function(){b.emit("importNow"),a.windows.close("*"),_.assign(a.waiting,{screen:!0,icon:!0,anim:!0})},e["export"]=function(){b.emit("exportNow"),a.windows.close("*")},b.on("user",function(b){a.waiting.screen=!1,e.user=b,b.link&&b.picture&&d.preloadImages(b.picture).then(function(a){e.gplus=!0,angular.element(document.one("#picture")).css("background-image","url("+b.picture+")").bind("click",function(){window.open(b.link)})}),b.connex||a.windows.open("help"),b.session&&c.init(b.session)}),b.on("updateUser",function(b){_.assign(e.user,b),a.windows.close("profile"),e.reset()}),b.on("updateNok",function(){e.reset(),e.user.error=!0})}]}})}(),function(){"use strict";var a=angular.module("search",[]);a.directive("search",function(){return{restrict:"A",templateUrl:"./html/search.html",controller:["$scope","$socket","$idb",function(a,b,c){var d=a.search={result:{search:"",by:"",lang:"fr"}};d.reset=function(){d.result={search:"",by:"",lang:"fr"}},d.send=function(){a.windows.close("*"),a.navbar.isCollect=!1,a.navbar.filtre=d.last=a.tags.last=null,document.one(".sortBy")&&document.one(".sortBy").toggleClass("sortBy",!1),_.isEqual(this.result,this.last)||a.bookcells.reset().then(function(){d.last=d.result,c.getQuery(d.result).then(function(b){d.reset(),a.bookcells.cells=b,_.assign(a.waiting,{screen:!1,icon:!1,anim:!1})})["catch"](function(){b.emit("searchBooks",d.last),d.reset()})})},d.associated=function(){var e={associated:a.detail.book.id,search:a.detail.book.title};a.windows.close("*"),a.navbar.isCollect=!1,a.navbar.filtre=d.last=a.tags.last=null,document.one(".sortBy")&&document.one(".sortBy").toggleClass("sortBy",!1),_.isEqual(e,this.last)||a.bookcells.reset().then(function(){d.last=e,c.getQuery(e).then(function(b){d.reset(),d.cells=b,_.assign(a.waiting,{screen:!1,icon:!1,anim:!1})})["catch"](function(){b.emit("associated",e.associated),d.reset()})})},d.recommanded=function(){var e={recommand:a.profile.user.id,search:a.trads.recommand4u};a.windows.close("*"),a.navbar.isCollect=!1,a.navbar.filtre=d.last=a.tags.last=null,document.one(".sortBy")&&document.one(".sortBy").toggleClass("sortBy",!1),_.isEqual(e,d.last)||a.bookcells.reset().then(function(){d.last=e,c.getQuery(e).then(function(b){d.reset(),a.bookcells.cells=b,_.assign(a.waiting,{screen:!1,icon:!1,anim:!1})})["catch"](function(){b.emit("recommanded"),d.reset()})})}}]}})}(),function(){"use strict";var a=angular.module("bookcells",[]);a.directive("bookcells",function(){return{restrict:"A",templateUrl:"./html/bookcells.html",controller:["$scope","$socket","$idb","$preloader",function(a,b,c,d){var e=a.bookcells={},f=function(a,b){e.cells||(e.cells=[]),e.collection||(e.collection=[]),_.forEach(a,function(a){var c=_.findIndex(e.collection,_.matchesProperty("id",a.id)),d=-1===_.findIndex(e.cells,_.matchesProperty("id",a.id));d&&e.cells.push(_.assign(e.collection[c]||a,{index:e.cells.length,inCollection:b||-1!==c})),b&&-1===c&&e.collection.push(angular.copy(a))})};e.width=~~(document.one("[bookcells]").clientWidth/~~(document.one("[bookcells]").clientWidth/256))-~~(document.one("[bookcells]").clientWidth/256)+"px",e.iwidth=~~(document.one("[bookcells]").clientWidth/~~(document.one("[bookcells]").clientWidth/256))-~~(document.one("[bookcells]").clientWidth/256)-20+"px",e.addBook=function(c){-1===_.findIndex(e.collection,_.matchesProperty("id",c.id))&&(this.cell||_.assign(_.find(e.cells,_.matchesProperty("id",c.id)),{inCollection:!0}),e.collection.push(c),e.collection=_.sortByOrder(e.collection,"title"),_.assign(c,{inCollection:!0,index:e.collection.length-1}),c["new"]?a.navbar.isCollect&&(e.cells.push(c),document.one("#sort > div").hasClass("sortBy")||(document.one(".sortBy").toggleClass("sortBy",!1),document.one("#sort > div").toggleClass("sortBy",!0)),e.cells=_.sortByOrder(e.cells,"title")):b.emit("addBook",c.id))},e.removeBook=function(c){_.remove(this.collection,_.matchesProperty("id",c.id)),b.emit("removeBook",c.id),c.tags&&a.tags.init(),a.navbar.isCollect?_.pull(this.cells,c):_.assign(c,{inCollection:!1,tags:[],userNote:null,userComment:null,index:null})},e.reset=function(){return _.assign(a.waiting,{screen:!0,icon:!0,anim:!0}),new Promise(function(b){delete e.cells,a.tags.last=a.search.last=a.navbar.filtre=a.navbar.last=null,document.one("[bookcells]").css({top:document.one("#navbar").clientHeight}),b()})},b.on("initCollect",function(b){_.assign(a.waiting,{icon:!1,anim:!0}),(!a.windows.opened||_.isEmpty(a.windows.opened))&&_.assign(a.waiting,{screen:!1}),f(b,!0)}),b.on("endCollect",function(b){a.navbar.isCollect=!0,a.tags.init(),f(b,!0),_.assign(a.waiting,{icon:!1,anim:!1}),e.cells&&(e.cells=_.sortByOrder(e.cells,"title")),(!a.windows.opened||_.isEmpty(a.windows.opened))&&_.assign(a.waiting,{screen:!1})}),b.on("covers",function(b){for(var c=0,d=b.length;d>c;c++){var f=_.find(e.collection,_.matchesProperty("id",b[c].id))||{},g=_.find(e.cells,_.matchesProperty("id",b[c].id))||{};f.base64=g.base64=b[c].base64,f.alternative=g.alternative=b[c].alternative,a.detail.book&&a.detail.book.id===b[c].id&&(a.detail.book.base64=b[c].base64,a.detail.book.alternative=b[c].alternative)}}),b.on("books",function(b){f(b),_.assign(a.waiting,{icon:!1,anim:!0}),(!a.windows.opened||_.isEmpty(a.windows.opened))&&_.assign(a.waiting,{screen:!1})}),b.on("returnAdd",function(a){var b=_.findIndex(e.cells,_.matchesProperty("id",a.id));-1!==b?_.assign(e.cells[b],a):e.cells.push(a)}),b.on("endRequest",function(b){!a.navbar.isCollect&&e.lastSearch&&c.setQuery(e.lastSearch,e.cells),_.assign(a.waiting,{icon:!1,anim:!1}),(!a.windows.opened||_.isEmpty(a.windows.opened))&&_.assign(a.waiting,{screen:!1})}),a.$on("dropEvent",function(b,c,d){if(_.isEqual(c,d))return!1;var f=_.findIndex(e.cells,_.matchesProperty("id",c.id)),g=_.remove(e.cells,c)[0],h=_.findIndex(e.cells,_.matchesProperty("id",d.id));a.navbar.saveorder=!0,h>=f&&h++,e.cells.splice(h,0,g),a.$apply()})}],controllerAs:"bookcells"}}),a.directive("defSrc",["$window","$preloader",function(a,b){return{restrict:"A",link:function(c,d,e){c.$watch("cell.alternative || cell.base64",function(e){e&&c.$watch(function(){return!c.cell.source&&!!d[0].getBoundingClientRect().top&&a.innerHeight>d[0].getBoundingClientRect().top},function(a){a&&b.preloadImages(e).then(function(a){c.cell.source=e})})})}}}])}(),function(){"use strict";var a=angular.module("detail",["search"]);a.directive("detail",function(){return{restrict:"A",templateUrl:"./html/detail.html",link:function(a,b,c){a.$watch("windows.opened.detail",function(b){b||(a.detail.reset(),document.one("#iPreview").contentWindow.document.body&&document.one("#iPreview").contentWindow.document.body.parentNode.removeChild(document.one("#iPreview").contentWindow.document.body))}),a.$watch("windows.opened.preview",function(a){a&&(document.one("#iPreview").contentWindow.document.getElementById("viewer")?document.one("#iPreview").contentWindow.document.querySelector("[dir=ltr]")&&(document.one("#iPreview").contentWindow.document.querySelector("[dir=ltr]").scrollTop=0):document.one("[target]").submit())})},controller:["$scope","$socket","$idb","$thief","$timeout",function(a,b,c,d,e){var f=a.detail={},g=a.context={},h=(a.preview={},function(a){var b=d.getColor(a),c="#"+((1<<24)+(b[0]<<16)+(b[1]<<8)+b[2]).toString(16).substr(1);return{rgb:b,hex:c}});f.editToggle=function(a){this.edit[a]=this.edit.able?!this.edit[a]:!1},f.addBook=function(){return this.edit["new"]?(b.emit("newbook",this.book),void(this.edit["new"]=!1)):void a.bookcells.addBook(this.book)},f.updateBook=function(){if(a.windows.close("detail"),this.ref&&(angular.equals(new Date(this.book.publishedDate),this.XDate)||(this.book.publishedDate=this.XDate),!angular.equals(this.ref,this.book))){var c={},d=_.find(a.bookcells.cells,_.matchesProperty("id",this.ref.id)),e=_.find(a.bookcells.collection,_.matchesProperty("id",this.ref.id));_.forEach(this.book,function(a,b){_.isEqual(a,f.ref[b])||(c[b]=a)}),_.assign(this.ref,this.book),c.userComment&&(this.book.userDate=c.userDate=new Date),d&&_.assign(d,c),e&&_.assign(e,c),b.emit("updateBook",_.merge(c,{id:this.book.id})),c.tags&&a.tags.init()}},f.searchBy=function(b){return a.waiting&&a.waiting.anim?!1:(a.search.result={by:b.target.getAttribute("searchby"),search:b.target.html(),lang:"fr"},void a.search.send())},f.uploadCover=function(){document.one("[type=file]").trigger("click")},f.prepare=function(b){var c=a.bookcells.cells[b],d=angular.copy(_.find(a.bookcells.collection,_.matchesProperty("id",c.id)));_.assign(a.waiting,{screen:!0,icon:!0}),d||c.updated?f.show(d||c):this.load(c)},f.load=function(d,e){var g=e||d.id;c.getDetail(g).then(function(c){c?(d&&_.assign(d,c),f.show(c),a.$apply()):b.emit("searchDetail",g)})},f.setBack=function(){if(f.book.alternative||f.book.base64){var a=h(document.one("#detailCover")).hex;document.one("[detail]").css({background:"radial-gradient(circle at 50%, whitesmoke 0%, "+a+" 100%)"})}},f.show=function(c){f.reset(),c.alternative||c.base64||document.one("[detail]").css({background:"radial-gradient(circle at 50%, whitesmoke 0%, #909090 100%)"}),a.waiting.icon=!1,f.ref=angular.copy(c),f.book=c,f.XDate=f.book.publishedDate?new Date(f.book.publishedDate):null,f.edit.able=_.isPlainObject(f.book.id)&&f.book.id.user===a.profile.user.id,_.isEmpty(f.book)&&_.assign(f.edit,{able:!0,"new":!0}),e(a.windows.open("detail")).then(function(){f.height=document.one("[detail]").clientHeight-document.one("[detail] header").clientHeight,document.one(".detailBook").scrollTop=0}),c.id&&!c.id.user&&b.emit("mostAdded",c.id)},f.reset=function(){delete this.ref,delete this.book,delete this.mostAdded,this.edit={able:!1,"new":!1},this.tag=null,document.alls(".new")&&document.alls(".new").toggleClass("new",!1)},f.parseAuthors=function(){this.book.authors=_.uniq(this.book.authors.noSpace().split(","))},f.addTag=function(){this.book.tags||(this.book.tags=[]),-1===this.book.tags.indexOf(this.tag)&&(this.book.tags.push(this.tag),this.book.tags.sort()),this.tag=null},f.byTag=function(b){a.navbar.isCollect&&(a.tags.search(f.book.tags[b]),a.waiting.screen=a.waiting.over=!1)},f.removeTag=function(a){_.pullAt(this.book.tags,a)},f.recommand=function(){a.windows.close("recommand"),b.emit("sendNotif",{recommand:this.recommandTo,id:a.detail.book.id}),this.recommandTo=null},f.noSpace=function(a){this.book[a]=this.book[a].noSpace()},b.on("returnDetail",function(b){c.setDetail(b);var d=_.find(a.bookcells.cells,_.matchesProperty("id",b.id));d&&(d.updated=!0,_.assign(d,b)),a.detail.show(b)}),b.on("returnNotif",function(b){var d=_.find(a.bookcells.cells,_.matchesProperty("id",b.id));d&&(d.updated=!0,_.assign(d,b)),a.detail.show(b),c.setDetail(b)}),b.on("newbook",function(b){_.assign(f.book,b),f.book["new"]=!0,a.bookcells.addBook(f.book)}),b.on("mostAdded",function(a){a.book===f.book.id&&(f.mostAdded=a.mostAdded)}),angular.element(document.one("[detail] article")).bind("contextmenu",function(b){b.preventDefault(),g.show=!0,a.$apply();var c=document.one("#contextMenu");return c.clientHeight>this.clientHeight?g.show=!1:g.style={top:(b.clientY+c.clientHeight>window.innerHeight?b.clientY-c.clientHeight:b.clientY)+"px",left:(b.clientX+c.clientWidth>window.innerWidth?b.clientX-c.clientWidth:b.clientX)+"px"},a.$apply(),!1}),angular.element(document.one("#uploadHidden [type=file]")).bind("change",function(){var b=this.files[0];if(b){var c=new FileReader;c.onload=function(c){return!b.type.match(/image.*/)||b.size>1e5?(document.one("#uploadHidden [type=hidden]").click(),!1):(f.book.alternative=c.target.result,void a.$apply())},c.readAsDataURL(b),document.one("#uploadHidden").reset()}}),angular.element(document.one("#detailCover")).bind("load",f.setBack),angular.element(document.alls("[searchby]")).bind("click",f.searchBy),angular.element(document.alls(".note")).bind("click",function(b){"1"===f.book.userNote&&"1"===b.target.getAttribute("note")?f.book.userNote="0":f.book.userNote=b.target.getAttribute("note"),a.$apply()}).bind("mousehover, mouseenter",function(a){for(var b=a.target.getAttribute("note"),c=document.alls(".note"),d=Math.min(f.book.userNote,b);d<Math.max(f.book.userNote,b);d++)c[d].hasClass("select")?c[d].toggleClass("minus",!0):c[d].toggleClass("plus",!0)}).bind("mouseleave",function(){document.alls(".note").toggleClass("plus",!1).toggleClass("minus",!1)}),angular.element(document.alls("#contextMenu [nav]")).bind("click",function(){var b=_.filter(a.bookcells.cells,function(a){return!a.toHide&&!a.toFilter}),c=_.findIndex(b,_.matchesProperty("id",f.book.id)),d=c,g=~~(document.one("[bookcells]").clientWidth/256),h=document.alls(".bookcell:not(.ng-hide)");if(-1!==c){switch(this.getAttribute("nav")){case"top":c>g&&(d-=g);break;case"bottom":c+g<b.length&&(d+=g);break;case"left":c&&d--;break;case"right":c<b.length-1&&d++;break;default:return}d!==c&&e(a.windows.close("detail")).then(function(){h[c].offsetTop!==h[d].offsetTop&&window.scroll(0,h[d].offsetTop),b[d].inCollection?f.show(b[d]):f.prepare(d)})}})}]}})}(),function(){"use strict";var a=angular.module("defcloak",[]);a.directive("defCloak",["$timeout",function(a){return{restrict:"A",link:{post:function(b,c,d){a(function(){d.$set("defCloak",void 0),c.removeClass("def-cloak")})}}}}])}();
