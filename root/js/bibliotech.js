if(window.FileReader&&window.Promise&&"formNoValidate"in document.createElement("input")){var start=new Date,µ=document,app=angular.module("bibliotech",["navbar","search","profile","bookcells","detail"]);app.config(["$interpolateProvider","$sceProvider",function(a,b){a.startSymbol("[{"),a.endSymbol("}]"),b.enabled(!1)}]),app.factory("$thief",function(){return{getColor:(new ColorThief).getColor,getPalette:(new ColorThief).getPalette}}),app.factory("$idb",function(){return{deleteDetail:function(a){this.db&&this.db.transaction(["details"],"readwrite").objectStore("details")["delete"](a)},deleteQuery:function(a){this.db&&this.db.transaction(["queries"],"readwrite").objectStore("queries")["delete"](a)},getDetail:function(a){var b=this;return _.isPlainObject(a)&&(a=JSON.stringify(a)),new Promise(function(c){b.db||c();var d=b.db.transaction(["details"],"readwrite").objectStore("details").index("by_id").get(a);d.onsuccess=function(){this.result?c(this.result):c()},d.onerror=function(){c()}})},getQuery:function(a){var b=this;return new Promise(function(c,d){b.db||d();var e=b.db.transaction(["queries"],"readwrite").objectStore("queries").index("by_query").get(JSON.stringify(a));e.onsuccess=function(){this.result&&this.result.books&&this.result.books.length?c(this.result.books):d()},e.onerror=d})},init:function(a){var b=this;return this.indexedDB=window.indexedDB||window.mozIndexedDB||window.webkitIndexedDB||window.msIndexedDB,new Promise(function(c,d){if(b.indexedDB){var e=indexedDB.open(a,1);e.onerror=function(){d()},e.onsuccess=function(){b.db=this.result,c()},e.onupgradeneeded=function(){var a=this.result;a.createObjectStore("queries",{keyPath:"query"}).createIndex("by_query","query",{unique:!0}),a.createObjectStore("details",{keyPath:"id"}).createIndex("by_id","id",{unique:!0})}}})},setDetail:function(a){if(this.db){this.db.transaction(["details"],"readwrite").objectStore("details").put(a)}},setQuery:function(a,b){if(this.db){this.db.transaction(["queries"],"readwrite").objectStore("queries").put({query:JSON.stringify(a),books:b})}}}}),app.factory("$socket",["$rootScope",function(a){var b=function(b){var c=function(){var c=b.connect({secure:!0,multiplex:!1}),e=function(a){µ.one("#noConnect").css({top:noConnect.clientHeight+a.clientY>window.innerHeight?a.clientY-noConnect.clientHeight:a.clientY,left:noConnect.clientWidth+a.clientX>window.innerWidth?a.clientX-noConnect.clientWidth:a.clientX})};return c.on("error",function(b){a.logout()}).once("connect",function(){_.assign(a.waiting,{connect:!1}),µ.removeEventListener("mousemove",e),start=new Date,this.once("disconnect",function(b){d(this),a.windows.close("*"),a.bookcells.reset(),µ.setEvents({mousemove:e}),setTimeout(function(){_.assign(a.waiting,{connect:!0})},2e3),a.$apply()}),this.on("logout",a.logout)}),c},d=function(a){var b=setInterval(function(){a&&a.connected&&"open"===a.io.readyState&&(clearInterval(b),socket=c());try{a.connect()}catch(d){}},3e3)};return c()}(io);return{on:function(c,d){b.on(c,function(){var c=arguments;a.$apply(function(){d.apply(b,c)})})},emit:function(a,c){b.emit(a,c)},close:function(){b.close()}}}]),app.directive("defCloak",function(){return{restrict:"A",link:function(a,b,c){c.$set("defCloak",void 0),b.removeClass("def-cloak")}}}),app.directive("drag",["$rootScope",function(a){var b=function(a,b,c){b.addClass(c),a.dataTransfer.setData("id",a.target.id),a.dataTransfer.effectAllowed="move"},c=function(a,b,c){b.removeClass(c)};return{restrict:"A",link:function(d,e,f){f.$set("draggable","true"),d.dragData=d[f.drag],d.dragStyle=f.dragstyle,e.on("dragstart",function(c){a.draggedElement=d.dragData,b(c,e,d.dragStyle)}),e.bind("dragend",function(a){c(a,e,d.dragStyle)})}}}]),app.directive("drop",["$rootScope",function(a){var b=function(a,b,c){a.preventDefault(),b.addClass(c)},c=function(a,b,c){b.removeClass(c)},d=function(a){a.preventDefault()},e=function(a,b,c){a.preventDefault(),b.removeClass(c)};return{restrict:"A",link:function(f,g,h){f.dropData=f[h.drop],f.dropStyle=h.dropstyle,g.bind("dragenter",function(a){b(a,g,f.dropStyle)}),g.bind("dragleave",function(a){c(a,g,f.dropStyle)}),g.bind("dragover",d),g.bind("drop",function(b){e(b,g,f.dropStyle),a.$broadcast("dropEvent",a.draggedElement,f.dropData)})}}}]),app.directive("compareTo",["$rootScope",function(a){return{restrict:"A",require:"ngModel",scope:{otherModelValue:"=compareTo",notEquals:"@"},link:function(a,b,c,d){d.$validators.compareTo=function(b){return a.notEquals?b!==a.otherModelValue:b===a.otherModelValue},a.$watch("otherModelValue",function(){d.$validate()})}}}]),app.directive("message",["$rootScope",function(a){return{restrict:"A",scope:{message:"@",titre:"@",callback:"=callback"},link:function(b,c,d){c.on("click",function(){var c=a.confirm={};c.titre=a.trads[b.titre],c.message=a.trads[b.message],c.callback=b.callback,a.windows.open("confirm")})}}}]),app.directive("autoFocus",["$timeout",function(a){return{restrict:"A",link:function(b,c,d){b.$watch(d.autoFocus,function(b){a(function(){b&&c[0].focus()})})}}}]),app.directive("description",["$timeout",function(a){return{restrict:"A",link:function(b,c,d){var e=function(c){if(this.one(".description")||b.noShow)return void delete b.noShow;var d=this,e=b.cell.description.indexOf(" ",500),g=b.cell.title,h=b.cell.description.substr(0,Math.max(e,500))+(-1!==e?"...":""),i=d.clientWidth,j=d.clientHeight,k=µ.one("[bookcells]").clientHeight-(d.yposition()+j)<j?-(j/3).toFixed(0):(j/3).toFixed(0),l=µ.one("[bookcells]").clientWidth-(d.xposition()+i)<i?-(i/3).toFixed(0):(i/3).toFixed(0),m="top: "+k+"px; left: "+l+"px; width: "+i+"px;",n=angular.element('<div class="description notdisplayed" style="'+m+'"><span>'+g+"</span><div>"+h+"</div></div>");angular.element(d).append(n),a(function(){n&&(n.toggleClass("notdisplayed",!1),n.on("click",function(){b.noShow=!0,f.call(d)}))},1e3)},f=function(a){this.one(".description")&&this.removeChild(this.one(".description"))};c.on("mouseover",e),c.on("mouseleave",f)}}}])}else alert(document.body.getAttribute("error"));!function(){var a=angular.module("bookcells",[]);a.directive("bookcells",function(){return{restrict:"A",templateUrl:"./html/bookcells.html",controller:["$scope","$socket","$idb",function(a,b,c){var d=a.bookcells={},e=function(a,b){d.cells||(d.cells=[]),d.collection||(d.collection=[]),_.forEach(a,function(a){var c=_.findIndex(d.collection,_.matchesProperty("id",a.id)),e=-1===_.findIndex(d.cells,_.matchesProperty("id",a.id));e&&d.cells.push(_.assign(d.collection[c]||a,{index:d.cells.length,inCollection:b||-1!==c})),b&&-1===c&&d.collection.push(a)})};d.style={width:~~(µ.one("[bookcells]").clientWidth/~~(µ.one("[bookcells]").clientWidth/256))-10+"px"},d.addBook=function(c){-1===_.findIndex(d.collection,_.matchesProperty("id",c.id))&&(_.assign(c,{inCollection:!0}),this.cell||_.assign(_.find(d.cells,_.matchesProperty("id",c.id)),{inCollection:!0}),d.collection.push(c),d.collection=_.sortByOrder(d.collection,"title"),c["new"]?a.navbar.isCollect&&(d.cells.push(c),µ.one("#sort > div").hasClass("sortBy")||(µ.one(".sortBy").toggleClass("sortBy",!1),µ.one("#sort > div").toggleClass("sortBy",!0),d.cells=_.sortByOrder(d.cells,"title"))):b.emit("addBook",c.id))},d.removeBook=function(c){_.remove(this.collection,_.matchesProperty("id",c.id)),b.emit("removeBook",c.id),a.navbar.isCollect?_.pull(this.cells,c):_.assign(c,{inCollection:!1})},d.reset=function(){_.assign(a.waiting,{screen:!0,icon:!0,anim:!0}),this.cells=[],this.filtre=this.last=this.tag=null,µ.one("[bookcells]").css({top:µ.one("#navbar").clientHeight})},b.on("initCollect",function(b){_.assign(a.waiting,{screen:!1,icon:!1,anim:!0}),e(b,!0)}),b.on("endCollect",function(b){a.navbar.isCollect=!0,a.tags.init(),e(b,!0),_.assign(a.waiting,{screen:!1,icon:!1,anim:!1})}),b.on("covers",function(b){return new Promise(function(c){for(var e=0,f=b.length;f>e;e++){var g=_.find(d.cells,_.matchesProperty("id",b[e].id))||{},h=_.find(d.collection,_.matchesProperty("id",b[e].id))||{};g.base64=h.base64=b[e].base64,g.alternative=h.alternative=b[e].alternative,a.detail.book&&a.detail.book.id===b[e].id&&(a.detail.book.base64=b[e].base64,a.detail.book.alternative=b[e].alternative)}c()})}),b.on("books",function(b){e(b),_.assign(a.waiting,{screen:!1,icon:!1,anim:!0})}),b.on("returnAdd",function(a){var b=_.findIndex(d.cells,_.matchesProperty("id",a.id));-1!==b?_.assign(d[b],a):d.cells.push(a)}),b.on("endRequest",function(b){!a.navbar.isCollect&&d.lastSearch&&c.setQuery(d.lastSearch,d.cells),_.assign(a.waiting,{screen:!1,icon:!1,anim:!1})}),a.$on("dropEvent",function(b,c,e){if(_.isEqual(c,e))return!1;var f=_.findIndex(d.cells,_.matchesProperty("id",c.id)),g=_.remove(d.cells,c)[0],h=_.findIndex(d.cells,_.matchesProperty("id",e.id));a.navbar.saveorder=!0,h>=f&&h++,d.cells.splice(h,0,g),a.$apply()})}],controllerAs:"bookcells"}})}(),function(){var a=angular.module("detail",["search"]);a.directive("detail",function(){return{restrict:"A",templateUrl:"./html/detail.html",controller:["$scope","$socket","$idb","$thief",function(a,b,c,d){var e=a.detail={},f=a.preview={},g=function(a){var b=d.getColor(a),c="#"+((1<<24)+(b[0]<<16)+(b[1]<<8)+b[2]).toString(16).substr(1);return{rgb:b,hex:c}};e.editToggle=function(a){this.edit[a]=this.edit.able?!this.edit[a]:!1},e.addBook=function(){return this.edit["new"]?(b.emit("newbook",this.book),void(this.edit["new"]=!1)):a.bookcells.addBook(this.book)},e.updateBook=function(){if(a.windows.close("detail"),angular.equals(new Date(this.book.publishedDate),this.XDate)||(this.book.publishedDate=this.XDate),!angular.equals(this.ref,this.book)){var c={},d=_.find(a.bookcells.cells,_.matchesProperty("id",this.ref.id));_.forEach(this.book,function(a,b){_.isEqual(a,e.ref[b])||(c[b]=a)}),_.assign(this.ref,this.book),d&&_.assign(d,this.book),c.userComment&&(this.book.userDate=c.userDate=new Date),b.emit("updateBook",_.merge(c,{id:this.book.id})),c.tags&&a.tags.init()}},e.searchBy=function(b){a.search.result={by:b.target.getAttribute("searchby"),search:b.target.html(),lang:"fr"},a.search.send()},e.uploadCover=function(){µ.one("[type=file]").trigger("click")},e.prepare=function(d){var f=a.bookcells.cells[d],g=_.find(a.bookcells.collection,_.matchesProperty("id",f.id));_.assign(a.waiting,{screen:!0,icon:!0}),g||f.updated?e.show(g||f):c.getDetail(f.id).then(function(c){c?(_.assign(f,c),e.show(c),a.$apply()):b.emit("searchDetail",f.id)})},e.setBack=function(){if(e.book.alternative||e.book.base64){var a=g(µ.one("#detailCover")).hex;µ.one("[detail]").css({background:"radial-gradient(circle at 50%, whitesmoke 0%, "+a+" 100%)"})}},e.show=function(b){e.reset(),b.alternative||b.base64||µ.one("[detail]").css({background:"radial-gradient(circle at 50%, whitesmoke 0%, #909090 100%)"}),a.windows.open("detail").then(function(){e.height=µ.one("[detail]").clientHeight-µ.one("[detail] header").clientHeight,µ.one(".detailBook").scrollTop=0}),a.waiting.icon=!1,e.ref=b,e.book=angular.copy(b),e.XDate=e.book.publishedDate?new Date(e.book.publishedDate):null,e.edit.able=_.isPlainObject(e.book.id)&&e.book.id.user===a.profile.user.id,_.isEmpty(e.book)&&_.assign(e.edit,{able:!0,"new":!0})},e.reset=function(){delete this.ref,delete this.book,this.edit={able:!1,"new":!1},this.tag=null,µ.alls(".new")&&µ.alls(".new").toggleClass("new",!1)},e.parseAuthors=function(){this.book.authors=_.uniq(this.book.authors.noSpace().split(","))},e.addTag=function(){this.book.tags||(this.book.tags=[]),-1===this.book.tags.indexOf(this.tag)&&(this.book.tags.push(this.tag),this.book.tags.sort()),this.tag=null},e.byTag=function(b){a.tags.search(e.book.tags[b]),a.waiting.screen=a.waiting.over=!1},e.removeTag=function(a){_.pullAt(this.book.tags,a)},e.recommand=function(){a.windows.close("recommand"),b.emit("sendNotif",{recommand:this.recommandTo,id:a.detail.book.id}),this.recommandTo=null},e.noSpace=function(a){this.book[a]=this.book[a].noSpace()},f.open=function(){µ.one("[target]").submit(),a.windows.open("preview")},b.on("returnDetail",function(b){var d=_.find(a.bookcells.cells,_.matchesProperty("id",b.id));d&&(d.updated=!0,_.assign(d,b)),c.setDetail(b),a.detail.show(b)}),b.on("returnNotif",function(b){var d=_.find(a.bookcells.cells,_.matchesProperty("id",b.id));d&&(d.updated=!0,_.assign(d,b)),a.detail.show(b),c.setDetail(b)}),b.on("newbook",function(b){_.assign(e.book,b),e.book["new"]=!0,a.bookcells.addBook(e.book)}),angular.element(µ.alls("#uploadHidden [type=file]")).on("change",function(){var b=this.files[0];if(b){if(!b.type.match(/image.*/)||b.size>1e5)return confirm("error",'Veuillez sélectionner un fichier de type "image" inférieure à 100KB.'),!1;var c=new FileReader;c.onload=function(b){e.book.alternative=b.target.result,a.$apply()},c.readAsDataURL(b)}}),angular.element(µ.one("#detailCover")).on("load",e.setBack),angular.element(µ.alls(".link")).on("click",e.searchBy),angular.element(µ.alls(".note")).on("click",function(b){"1"===e.book.userNote&&"1"===b.target.getAttribute("note")?e.book.userNote="0":e.book.userNote=b.target.getAttribute("note"),a.$apply()}).on("mousehover, mouseenter",function(a){for(var b=a.target.getAttribute("note"),c=µ.alls(".note"),d=Math.min(e.book.userNote,b);d<Math.max(e.book.userNote,b);d++)c[d].hasClass("select")?c[d].toggleClass("minus",!0):c[d].toggleClass("plus",!0)}).on("mouseleave",function(){µ.alls(".note").toggleClass("plus",!1).toggleClass("minus",!1)})}]}})}(),function(){var a=angular.module("navbar",[]);a.directive("navbar",function(){return{restrict:"A",templateUrl:"./html/navbar.html",controller:["$socket","$scope","$window","$idb","$http",function(a,b,c,d,e){var f=b.navbar={},g=b.tags={cloud:!1},h=b.windows={opened:{},top:0},i=(b.modal={sort:!1,notifs:!1},b.notifs={}),j=function(){if(!this.hasClass("sortBy")){var a=this.getAttribute("by"),c=this.getAttribute("sort");b.bookcells.cells=_.sortByOrder(b.bookcells.cells,[a],"desc"!==c),b.$apply(),µ.one(".sortBy")&&µ.one(".sortBy").toggleClass("sortBy",!1),this.toggleClass("sortBy",!0)}};b.trads={},b.waiting={screen:!0,over:!1,icon:!0,anim:!0},b.onFocus=function(a){return!0},b.windows.close=function(a){"*"===a?this.opened={}:delete this.opened[a],_.assign(b.waiting,{screen:!_.isEmpty(this.opened),over:!1})},b.windows.open=function(a,c){return new Promise(function(d){c&&h.close("*"),h.top=h.xcroll().top+10,h.opened[a]=!0,"sort"!==a&&"notifs"!==a&&_.assign(b.waiting,{screen:!0,over:_.keys(h.opened).length>1}),d()})},b.windows.xcroll=function(){return{top:c.scrollY||µ.documentElement.scrollTop,left:c.scrollX||µ.documentElement.scrollLeft}},b.logout=function(){return b.waiting.screen=!0,d.indexedDB&&d.indexedDB.deleteDatabase(b.profile.user.session),b.profile.user={},location.assign("/logout"),a.close(),!1},e.get("/trad").then(function(a){b.trads=a.data}),f.visible=!0,f.height=µ.one("#navbar").clientHeight,f.newbook=function(){b.waiting.screen=!0,b.detail.show({})},f.openUrl=function(a){c.open(a)},f.mailTo=function(){µ.location.href="mailto:admin@biblio.tech?subject=Bibliotech"},f.collection=function(){_.assign(b.waiting,{screen:!0,icon:!0}),f.isCollect||(b.bookcells.reset(),b.bookcells.cells=b.bookcells.collection,f.isCollect=!0),f.saveorder=!1,f.filtre=f.last=b.search.last=b.tags.last=null,µ.one(".sortBy")&&!µ.one("#sort > div").hasClass("sortBy")&&µ.one(".sortBy").toggleClass("sortBy",!1),µ.one("#sort > div").toggleClass("sortBy",!0),b.bookcells.cells=_.sortByOrder(b.bookcells.cells,"title"),_.forEach(b.bookcells.cells,function(a){_.assign(a,{toHide:!1,toFilter:!1})}),c.scroll(0,0),_.assign(b.waiting,{screen:!1,icon:!1,anim:!1})},f.filter=function(){var a=this.filtre.toLowerCase().noAccent().noSpace().split(" ").sort(),c=a.length;_.isEqual(a,this.last)||(this.last=a,_.forEach(b.bookcells.cells,function(b){if(_.isEqual(a,[""]))return void(b.toFilter=!1);for(var d=(b.title+" "+(b.subtitle?b.subtitle:"")+" "+(b.authors?b.authors.join(", "):"")+" "+b.description).toLowerCase().noAccent().noSpace(),e=0;c>e;e++)if(-1===d.indexOf(a[e]))return void(b.toFilter=!0);b.toFilter=!1}))},f.toggleMenu=function(){this.visible=!this.visible,µ.one("[bookcells]").css({top:this.visible?this.height:0})},f.saveOrder=function(){var c={id:b.tags.last,order:_.pluck(_.filter(b.bookcells.cells,function(a){return a.toHide===!1}),"id")},d=_.findIndex(b.profile.user.orders,_.matchesProperty("id",c.id));-1!==d?_.assign(b.profile.user.orders[d],{order:c.order}):(c["new"]=!0,b.profile.user.orders.push({id:c.id,order:c.order})),a.emit("orders",c),f.saveorder=!1},g.generate=function(){for(var a=µ.one("#cloud"),c=~~(a.clientHeight/2),d=~~(a.clientWidth/2),e=d/c,f=3,g=[],h=function(a,b){for(var c=function(a,b){return Math.abs(2*a.offsetLeft+a.offsetWidth-2*b.offsetLeft-b.offsetWidth)<a.offsetWidth+b.offsetWidth&&Math.abs(2*a.offsetTop+a.offsetHeight-2*b.offsetTop-b.offsetHeight)<a.offsetHeight+b.offsetHeight},d=0,e=b.length;e>d;d++)if(c(a,b[d]))return!0;return!1},i=0,j=b.tags.tags.length;j>i;i++){var k=b.tags.tags[i],l=a.newElement("span",{title:k.weight,"class":"tag tag"+Math.min(~~(k.weight/5)+1,10)}).html(k.text),m=c-l.clientHeight/2,n=d-l.clientWidth/2,o=0,p=6.28*Math.random();for(l.css({top:m,left:n});h(l,g);)o+=f,p+=(i%2===0?1:-1)*f,m=c+o*Math.sin(p)-l.clientHeight/2,n=d-l.clientWidth/2+o*Math.cos(p)*e,l.css({top:m,left:n});g.push(l)}a.alls("span").setEvents("click",b.tags.click)},g.show=function(){new Promise(function(a){a(h.open("cloud",!0))}).then(function(){µ.alls("#cloud span").length||b.tags.generate()})},g.click=function(){h.close("*"),g.search(this.html()),b.$apply()},g.search=function(a){b.tags.last=a,h.close("*"),f.saveorder=!1,c.scroll(0,0),f.filtre=f.last="";for(var d=_.find(b.profile.user.orders,_.matchesProperty("id",a)),e=0,g=b.bookcells.cells.length;g>e;e++)_.assign(b.bookcells.cells[e],{toHide:!_.includes(b.bookcells.cells[e].tags,a),toFilter:!1});if(d&&d.order)for(d.order.reverse(),e=0,g=d.order.length;g>e;e++){var i=_.remove(b.bookcells.cells,_.matchesProperty("id",d.order[e]));i.length&&b.bookcells.cells.splice(0,0,i[0])}},g.init=function(){var a=_.countBy(_.flatten(_.compact(_.pluck(b.bookcells.collection,"tags")),!0).sort()),c=[];if(a){var d="";_.forEach(a,function(a,b){c.push({text:b,weight:a}),d+="<option>"+b+"</option>"}),µ.one("#tagsList").html(d),this.tags=_.sortBy(c,"weight").reverse()}µ.alls("#cloud span").removeAll()},g.reset=function(){µ.alls("#cloud span").removeAll()},µ.one("[bookcells]").css({top:µ.one("#navbar").clientHeight}),a.on("notifs",function(a){b.notifs.notifs=a}),i.show=function(b){a.emit("readNotif",_.pullAt(this.notifs,b)[0])},angular.element(c).on("resize",function(){b.bookcells.style={width:~~(µ.one("[bookcells]").clientWidth/~~(µ.one("[bookcells]").clientWidth/256))-10+"px"},h.close("*"),b.tags.reset(),b.$apply()}).on("scroll",function(){b.footer=!!b.windows.xcroll().top,b.$apply()}).on("click",function(a){b.modal.navBottom=µ.one("#navbar").clientHeight+5,b.modal.sortLeft=µ.one("#tris").offsetLeft,b.modal.notifsLeft=µ.one("#notifications").offsetLeft,"tris"!==a.target.id&&(b.modal.sort=!1),"notifications"!==a.target.id&&(b.modal.notifs=!1),b.$apply()}).on("keypress, keydown",function(a){a=a||c.event;var d;if(!a.altKey){if(a.ctrlKey)if(-1!==[77,76,82,80,66,69,73,72].indexOf(a.keyCode)&&b.waiting.anim)d=!0;else switch(a.keyCode){case 77:f.toggleMenu(),d=!0;break;case 76:b.logout(),d=!0;break;case 82:h.open("search",!0),d=!0;break;case 80:h.open("profile",!0),d=!0;break;case 66:f.collection(),d=!0;break;case 69:b.tags.show(),d=!0;break;case 73:h.open("contacts",!0),d=!0;break;case 72:h.open("help",!0),d=!0}else 27===a.keyCode&&(b.windows.close("*"),d=!0);if(d)return a.preventDefault(),b.$apply(),!1}}),angular.element(µ.one("#footer")).on("click",function(){var a=setInterval(function(){var d=(b.windows.xcroll().top/2-.1).toFixed(1);c.scroll(0,d),.1>=d&&(c.scroll(0,0),clearInterval(a))},100)}),angular.element(µ.alls("#sort > div")).on("click",j)}]}})}(),function(){var a=angular.module("profile",[]);a.directive("profile",function(){return{restrict:"A",templateUrl:"./html/profile.html",controller:["$scope","$socket","$idb",function(a,b,c){var d=a.profile={};d.reset=function(){_.assign(this.user,{pwd:"",newPwd:"",confirmPwd:"",error:!1})},d.send=function(){b.emit("updateUser",this.user)},d["delete"]=function(){b.emit("deleteUser",this.user),a.windows.close("*")},d["import"]=function(){b.emit("importNow"),a.windows.close("*"),_.assign(a.waiting,{screen:!0,icon:!0,anim:!0})},d["export"]=function(){b.emit("exportNow"),a.windows.close("*"),_.assign(a.waiting,{screen:!0,icon:!0})},b.on("user",function(b){a.waiting.screen=!1,d.user=b,b.link&&b.picture&&!µ.one("#picture").isVisible()&&µ.one("#picture").css({"background-image":"url("+b.picture+")"}).setEvents("click",function(){window.open(b.link)}).toggleClass("notdisplayed",!1),b.connex||a.windows.open("help"),b.session&&c.init(b.session)}),b.on("updateUser",function(b){_.assign(d.user,b),a.windows.close("profile"),d.reset()}),b.on("updateNok",function(){d.reset(),d.user.error=!0})}]}})}(),function(){var a=angular.module("search",[]);a.directive("search",function(){return{restrict:"A",templateUrl:"./html/search.html",controller:["$scope","$socket","$idb",function(a,b,c){var d=a.search={result:{search:"",by:"",lang:"fr"}};d.reset=function(){d.result={search:"",by:"",lang:"fr"}},d.send=function(){a.windows.close("*"),a.navbar.isCollect=!1,a.navbar.filtre=d.last=a.tags.last=null,µ.one(".sortBy")&&µ.one(".sortBy").toggleClass("sortBy",!1),_.isEqual(this.result,this.last)||(this.last=this.result,a.bookcells.reset(),c.getQuery(this.result).then(function(b){d.reset(),a.bookcells.cells=b,_.assign(a.waiting,{screen:!1,icon:!1,anim:!1})})["catch"](function(){b.emit("searchBooks",d.last),d.reset()}))},d.associated=function(){var e={associated:a.detail.book.id,search:a.detail.book.title};a.windows.close("*"),a.navbar.isCollect=!1,a.navbar.filtre=d.last=a.tags.last=null,µ.one(".sortBy")&&µ.one(".sortBy").toggleClass("sortBy",!1),_.isEqual(e,this.last)||(this.last=e,a.bookcells.reset(),c.getQuery(e).then(function(b){d.reset(),d.cells=b,_.assign(a.waiting,{screen:!1,icon:!1,anim:!1})})["catch"](function(){b.emit("associated",e.associated),d.reset()}))},d.recommanded=function(){var e={recommand:a.profile.user.id,search:a.trads.recommand4u};a.windows.close("*"),a.navbar.isCollect=!1,a.navbar.filtre=d.last=a.tags.last=null,µ.one(".sortBy")&&µ.one(".sortBy").toggleClass("sortBy",!1),_.isEqual(e,d.last)||(d.last=e,a.bookcells.reset(),c.getQuery(e).then(function(b){d.reset(),a.bookcells.cells=b,_.assign(a.waiting,{screen:!1,icon:!1,anim:!1})})["catch"](function(){b.emit("recommanded"),d.reset()}))}}]}})}();
