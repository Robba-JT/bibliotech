if(window.FileReader&&"formNoValidate"in document.createElement("input")){var start=new Date,app=angular.module("bibliotech",["preloader","socket","defcloak","menu","search","profile","bookcells","detail"]);app.config(["$interpolateProvider","$sceProvider",function(a,b,c){"use strict";a.startSymbol("[{"),a.endSymbol("}]"),b.enabled(!1)}]),app.run(["$rootScope","$http","$window","$timeout","$socket",function(a,b,c,d,e){"use strict";b.get(["trads",document.documentElement.lang||"fr","bibliotech"].join("/")).then(function(b){a.trads=b.data}),a.waiting={screen:!0,over:!1,icon:!0,anim:!0},a.windows={opened:{},top:0,close:function(b){"*"===b?this.opened={}:delete this.opened[b],_.assign(a.waiting,{screen:!_.isEmpty(this.opened),over:!1})},open:function(b,c){c&&this.close("*"),this.opened[b]=this.xcroll().top.toString(),"sort"!==b&&"notifs"!==b&&_.assign(a.waiting,{screen:!0,over:_.keys(this.opened).length>1})},xcroll:function(){return{top:c.scrollY||document.documentElement.scrollTop,left:c.scrollX||document.documentElement.scrollLeft}}},e.connect(function(){_.assign(a.waiting,{connect:!1})}),e.disconnect(function(){a.windows.close("*"),a.bookcells.reset(),delete a.bookcells.collection,d(function(){_.assign(a.waiting,{connect:!0})},2e3),a.$apply()}),a.logout=function(){return a.waiting.screen=!0,a.profile.user={},c.location.assign("/logout"),e.close(),!1},angular.element(c).bind("scroll",function(){a.$apply(a.footer=!!a.windows.xcroll().top)}),angular.element(document.one("#footer")).bind("click",function(){var b=setInterval(function(){var d=(a.windows.xcroll().top/2-.1).toFixed(1);c.scroll(0,d),.1>=d&&(c.scroll(0,0),clearInterval(b))},100)})}]),app.factory("$thief",function(){"use strict";return{getColor:(new ColorThief).getColor,getPalette:(new ColorThief).getPalette}}),app.directive("compareTo",["$rootScope",function(a){"use strict";return{restrict:"A",require:"ngModel",scope:{otherModelValue:"=compareTo",notEquals:"@"},link:function(a,b,c,d){d.$validators.compareTo=function(b){return a.notEquals?b!==a.otherModelValue:b===a.otherModelValue},a.$watch("otherModelValue",function(){d.$validate()})}}}]),app.directive("message",["$rootScope","$window",function(a,b){"use strict";return{restrict:"A",scope:{message:"@",titre:"@",callback:"=callback"},link:function(c,d,e){d.on("click",function(){var d=a.confirm={};d.titre=a.trads[c.titre],d.message=a.trads[c.message],d.callback=c.callback,d.top=a.windows.xcroll().top+b.innerHeight/4,d.left=b.innerWidth/4,a.windows.open("confirm")})}}}])}else document.getElementsByClassName("waiting")[0].style.display=document.getElementsByClassName("waitAnim")[0].style.display="none";!function(){"use strict";var a=angular.module("preloader",[]);a.factory("$preloader",["$q","$rootScope","$http",function(a,b,c){var d=function(b){this.imageLocations=b,this.imageCount=this.imageLocations.length,this.loadCount=0,this.errorCount=0,this.states={PENDING:1,LOADING:2,RESOLVED:3,REJECTED:4},this.state=this.states.PENDING,this.deferred=a.defer(),this.promise=this.deferred.promise};return d.preloadImages=function(a){Array.isArray(a)||(a=[a]);var b=new d(a);return b.load()},d.prototype={constructor:d,isInitiated:function(){return this.state!==this.states.PENDING},isRejected:function(){return this.state===this.states.REJECTED},isResolved:function(){return this.state===this.states.RESOLVED},load:function(){if(this.isInitiated())return this.promise;this.state=this.states.LOADING;for(var a=0;a<this.imageCount;a++)this.loadImageLocation(this.imageLocations[a]);return this.promise},handleImageError:function(a){this.errorCount++,this.isRejected()||(this.state=this.states.REJECTED,this.deferred.reject(a))},handleImageLoad:function(a){this.loadCount++,this.isRejected()||(this.deferred.notify({percent:Math.ceil(this.loadCount/this.imageCount*100),imageLocation:a}),this.loadCount===this.imageCount&&(this.state=this.states.RESOLVED,this.deferred.resolve(this.imageLocations)))},loadImageLocation:function(a){var c=this,d=new Image;d.onload=function(a){b.$apply(function(){c.handleImageLoad(a.target.src),c=d=a=null})},d.onerror=function(a){b.$apply(function(){c.handleImageError(a.target.src),c=d=a=null})},d.src=a}},d}])}(),function(){"use strict";var a=angular.module("socket",[]);a.factory("$socket",["$rootScope","$timeout",function(a,b){var c={on:[],emit:[]},d=function(){var b=function(b,c){f.on(b,function(){var b=arguments;a.$apply(function(){c.apply(f,b)})})},d=function(){if(!document.body.getAttribute("page"))return location.assign("/logout");var d=window.location.origin||window.location.protocol+"//"+window.location.host,g=io.connect(d+"/"+document.body.getAttribute("page"),{secure:!0,multiplex:!1,reconnection:!1});return g.on("error",function(b){a.logout()}).once("connect",function(){this.emit("isConnected"),start=new Date,_.isFunction(c.connect)&&c.connect.apply(),this.once("disconnect",function(a){e(this),_.isFunction(c.disconnect)&&c.disconnect.apply()}),this.on("logout",a.logout);for(var d=0,g=c.on.length;g>d;d++)b(c.on[d].event,c.on[d].callback);for(d=0,g=c.emit.length;g>d;d++)f.emit(c.emit[d].event,c.emit[d].data);c.emit.length=0}),g},e=function(a){var b=setInterval(function(){a&&a.connected&&"open"===a.io.readyState&&(clearInterval(b),a.destroy(),f=d());try{a.connect()}catch(c){}},3e3)},f=d();return{on:function(a,d){f&&f.connected?b(a,d):c.on.push({event:a,callback:d})},connect:function(a){c.connect=a,f&&f.connected&&a.apply()},disconnect:function(a){c.disconnect=a,f&&f.connected&&f.once("disconnect",a)},emit:function(a,b){f&&f.connected?f.emit(a,b):c.emit.push({event:a,data:b})},close:function(){f.close()}}}();return d}])}(),function(){"use strict";var a=angular.module("menu",[]);a.directive("menu",function(){return{restrict:"A",templateUrl:"./html/menu.html",controller:["$socket","$scope","$window","$timeout",function(a,b,c,d){var e=b.navbar={},f=b.tags={cloud:!1},g=b.modal={sort:!1,notifs:!1},h=b.notifs={},i=function(){if(!this.hasClass("sortBy")){var a=this.getAttribute("by"),c=this.getAttribute("sort");_.forEach(b.bookcells.cells,function(a){a.scrolled=!1}),b.bookcells.cells=_.sortByOrder(b.bookcells.cells,[a],"desc"!==c),b.$apply(),document.one(".sortBy")&&document.one(".sortBy").toggleClass("sortBy",!1),this.toggleClass("sortBy",!0)}};e.visible=!1,e.newbook=function(){b.waiting.screen=!0,b.detail.show({})},e.toggle=function(a){"boolean"!=typeof a&&(a=!e.visible),document.one("#navbar").toggleClass("show",a),d(function(){e.visible=a},!a&&500),g.sort=!1},e.openUrl=function(a){c.open(a)},e.mailTo=function(){document.location.href="mailto:admin@biblio.tech?subject=Bibliotech"},e.collection=function(){e.saveorder=!1,document.one(".sortBy")&&!document.one("#sort > div").hasClass("sortBy")&&document.one(".sortBy").toggleClass("sortBy",!1),document.one("#sort > div").toggleClass("sortBy",!0),c.scroll(0,0),e.isCollect?(e.filtre=e.last=b.search.last=b.tags.last=null,_.forEach(b.bookcells.cells,function(a){_.assign(a,{toHide:!1,toFilter:!1,scrolled:!1})}),b.bookcells.cells=_.sortByOrder(b.bookcells.cells,"title")):b.bookcells.reset().then(function(){d(function(){b.bookcells.cells=angular.copy(_.sortByOrder(b.bookcells.collection,"title")),e.isCollect=!0}).then(function(){_.assign(b.waiting,{screen:!1,icon:!1,anim:!1})})})},e.filter=function(){var a=this.filtre.toLowerCase().noAccent().noSpace().split(" ").sort(),c=a.length;_.isEqual(a,this.last)||(this.last=a,_.forEach(b.bookcells.cells,function(b){if(b.scrolled=!1,_.isEqual(a,[""]))return void(b.toFilter=!1);for(var d=(b.title+" "+(b.subtitle?b.subtitle:"")+" "+(b.authors?b.authors.join(", "):"")+" "+b.description).toLowerCase().noAccent().noSpace(),e=0;c>e;e++)if(-1===d.indexOf(a[e]))return void(b.toFilter=!0);b.toFilter=!1}))},e.saveOrder=function(){var c={id:b.tags.last,order:_.map(_.filter(b.bookcells.cells,function(a){return a.toHide===!1}),"id")},d=_.findIndex(b.profile.user.orders,_.matchesProperty("id",c.id));-1!==d?_.assign(b.profile.user.orders[d],{order:c.order}):(c["new"]=!0,b.profile.user.orders.push({id:c.id,order:c.order})),a.emit("orders",c),e.saveorder=!1},f.generate=function(){for(var a=document.one("#cloud"),c=~~(a.clientHeight/2),d=~~(a.clientWidth/2),e=d/c,f=3,g=[],h=function(a,b){for(var c=function(a,b){return Math.abs(2*a.offsetLeft+a.offsetWidth-2*b.offsetLeft-b.offsetWidth)<a.offsetWidth+b.offsetWidth&&Math.abs(2*a.offsetTop+a.offsetHeight-2*b.offsetTop-b.offsetHeight)<a.offsetHeight+b.offsetHeight},d=0,e=b.length;e>d;d++)if(c(a,b[d]))return!0;return!1},i=0,j=b.tags.tags.length;j>i;i++){var k=b.tags.tags[i],l=a.newElement("span",{title:k.weight,"class":"tag tag"+Math.min(~~(k.weight/5)+1,10)}).html(k.text),m=c-l.clientHeight/2,n=d-l.clientWidth/2,o=0,p=6.28*Math.random();for(l.css({top:m,left:n});h(l,g);)o+=f,p+=(i%2===0?1:-1)*f,m=c+o*Math.sin(p)-l.clientHeight/2,n=d-l.clientWidth/2+o*Math.cos(p)*e,l.css({top:m,left:n});g.push(l)}angular.element(a.alls("span")).bind("click",b.tags.click)},f.show=function(){new Promise(function(a){a(b.windows.open("cloud",!0))}).then(function(){document.alls("#cloud span").length||b.tags.generate()})},f.click=function(){b.windows.close("*"),f.search(this.html()),b.$apply()},f.search=function(a){b.tags.last=a,b.windows.close("*"),e.saveorder=!1,c.scroll(0,0),e.filtre=e.last="";for(var d=_.find(b.profile.user.orders,_.matchesProperty("id",a)),f=0,g=b.bookcells.cells.length;g>f;f++)_.assign(b.bookcells.cells[f],{toHide:!_.includes(b.bookcells.cells[f].tags,a),toFilter:!1,scrolled:!1});if(d&&d.order)for(d.order.reverse(),f=0,g=d.order.length;g>f;f++){var h=_.remove(b.bookcells.cells,_.matchesProperty("id",d.order[f]));h.length&&b.bookcells.cells.splice(0,0,h[0])}},f.init=function(){var a=_.countBy(_.flatten(_.compact(_.pluck(b.bookcells.collection,"tags")),!0).sort()),c=[];if(a){var d="";_.forEach(a,function(a,b){c.push({text:b,weight:a}),d+="<option>"+b+"</option>"}),document.one("#tagsList").html(d),this.tags=_.sortBy(c,"weight").reverse()}document.alls("#cloud span").removeAll()},f.reset=function(){document.alls("#cloud span").removeAll()},a.on("notifs",function(a){b.notifs.notifs=a}),h.show=function(b){a.emit("readNotif",_.pullAt(this.notifs,b)[0])},angular.element(document.alls("#sort > div")).bind("click",i),angular.element(document.alls("#maskToggle, #affichToggle, #navbar div:not(#picture):not(.filtre):not(#tris):not(#notifications)")).bind("click",b.navbar.toggle)}]}})}(),function(){"use strict";var a=angular.module("profile",[]);a.directive("profile",function(){return{restrict:"A",templateUrl:"./html/profile.html",controller:["$scope","$socket","$preloader",function(a,b,c){var d=a.profile={};d.reset=function(){_.assign(this.user,{pwd:"",newPwd:"",confirmPwd:"",error:!1})},d.send=function(){b.emit("updateUser",this.user)},d["delete"]=function(){b.emit("deleteUser",this.user),a.windows.close("*")},d["import"]=function(){b.emit("importNow"),a.windows.close("*"),_.assign(a.waiting,{screen:!0,icon:!0,anim:!0})},d["export"]=function(){b.emit("exportNow"),a.windows.close("*")},b.on("user",function(b){a.waiting.screen=!1,d.user=b,b.link&&b.picture&&c.preloadImages(b.picture).then(function(a){d.gplus=!0,angular.element(document.one("#picture")).css("background-image","url("+b.picture+")").bind("click",function(){window.open(b.link)})})}),b.on("updateUser",function(b){_.assign(d.user,b),a.windows.close("profile"),d.reset()}),b.on("updateNok",function(){d.reset(),d.user.error=!0})}]}})}(),function(){"use strict";var a=angular.module("search",[]);a.directive("search",function(){return{restrict:"A",templateUrl:"./html/search.html",controller:["$scope","$socket",function(a,b){var c=a.search={result:{search:"",by:"",lang:"fr"}};c.reset=function(){c.result={search:"",by:"",lang:"fr"}},c.send=function(){a.windows.close("*"),a.navbar.isCollect=!1,a.navbar.filtre=c.last=a.tags.last=null,document.one(".sortBy")&&document.one(".sortBy").toggleClass("sortBy",!1),_.isEqual(this.result,this.last)||a.bookcells.reset().then(function(){c.last=c.result,b.emit("searchBooks",c.last),c.reset()})},c.associated=function(){var d={associated:a.detail.book.id,search:a.detail.book.title};a.windows.close("*"),a.navbar.isCollect=!1,a.navbar.filtre=c.last=a.tags.last=null,document.one(".sortBy")&&document.one(".sortBy").toggleClass("sortBy",!1),_.isEqual(d,this.last)||a.bookcells.reset().then(function(){c.last=d,b.emit("associated",d.associated),c.reset()})},c.recommanded=function(){var d={recommand:a.profile.user.id,search:a.trads.recommand4u};a.windows.close("*"),a.navbar.isCollect=!1,a.navbar.filtre=c.last=a.tags.last=null,document.one(".sortBy")&&document.one(".sortBy").toggleClass("sortBy",!1),_.isEqual(d,c.last)||a.bookcells.reset().then(function(){c.last=d,b.emit("recommanded"),c.reset()})}}]}})}(),function(){"use strict";var a=angular.module("bookcells",[]);a.directive("bookcells",["$window",function(a){return{restrict:"A",templateUrl:"./html/m.bookcells.html",controller:["$scope","$socket","$preloader","$timeout","$window",function(a,b,c,d,e){var f=a.bookcells={},g=function(a,b){f.cells||(f.cells=[]),f.collection||(f.collection=[]),_.forEach(a,function(a){var c=_.findIndex(f.collection,_.matchesProperty("id",a.id)),d=-1===_.findIndex(f.cells,_.matchesProperty("id",a.id));d&&f.cells.push(_.assign(f.collection[c]||a,{index:f.cells.length,inCollection:b||-1!==c,scrolled:!1,toHide:!1,toFilter:!1})),b&&-1===c&&f.collection.push(angular.copy(a))})},h=function(b){if(b){var c=_.find(f.collection,_.matchesProperty("id",b.id))||{},d=_.find(f.cells,_.matchesProperty("id",b.id))||{};c.base64=d.base64=b.base64,c.alternative=d.alternative=b.alternative,a.detail.book&&a.detail.book.id===b.id&&(a.detail.book.base64=b.base64,a.detail.book.alternative=b.alternative)}};f.addBook=function(c){-1===_.findIndex(f.collection,_.matchesProperty("id",c.id))&&(this.cell||_.assign(_.find(f.cells,_.matchesProperty("id",c.id)),{inCollection:!0}),f.collection.push(c),f.collection=_.sortBy(f.collection,function(a){return a.title.toLowerCase()}),_.assign(c,{inCollection:!0,index:f.collection.length-1}),c["new"]||b.emit("addBook",c.id),a.detail.book&&a.detail.book.id===c.id&&_.assign(a.detail.ref,{inCollection:!0,index:f.collection.length-1}),a.navbar.isCollect&&(f.cells.push(c),document.one("#sort > div").hasClass("sortBy")||(document.one(".sortBy").toggleClass("sortBy",!1),document.one("#sort > div").toggleClass("sortBy",!0)),f.cells=_.sortBy(f.cells,function(a){return a.title.toLowerCase()})))},f.removeBook=function(c){_.remove(this.collection,_.matchesProperty("id",c.id)),b.emit("removeBook",c.id),c.tags&&a.tags.init(),a.navbar.isCollect?_.pull(this.cells,c):_.assign(c,{inCollection:!1,tags:[],userNote:null,userComment:null,index:null})},f.reset=function(){return _.assign(a.waiting,{screen:!0,icon:!0,anim:!0}),new Promise(function(b){delete f.cells,a.tags.last=a.search.last=a.navbar.filtre=a.navbar.last=null,b()})},b.on("initCollect",function(c){_.assign(a.waiting,{icon:!1,anim:!0}),(!a.windows.opened||_.isEmpty(a.windows.opened))&&_.assign(a.waiting,{screen:!1}),g(c,!0),b.emit("tenmore")}),b.on("moreten",function(a){g(a,!0),b.emit("tenmore")}),b.on("endCollect",function(c){a.navbar.isCollect=!0,g(c,!0),a.tags.init(),_.assign(a.waiting,{icon:!1,anim:!1}),f.cells&&(f.cells=_.sortBy(f.cells,function(a){return a.title.toLowerCase()})),(!a.windows.opened||_.isEmpty(a.windows.opened))&&_.assign(a.waiting,{screen:!1}),b.emit("endCollect")}),b.on("cover",h),b.on("covers",function(a){for(var b=0,c=a.length;c>b;b++)h(a[b])}),b.on("books",function(b){g(b),_.assign(a.waiting,{icon:!1,anim:!0}),(!a.windows.opened||_.isEmpty(a.windows.opened))&&_.assign(a.waiting,{screen:!1})}),b.on("returnAdd",function(a){var b=_.findIndex(f.cells,_.matchesProperty("id",a.id));-1!==b?_.assign(f.cells[b],a):f.cells.push(a)}),b.on("endRequest",function(b){_.assign(a.waiting,{icon:!1,anim:!1}),(!a.windows.opened||_.isEmpty(a.windows.opened))&&_.assign(a.waiting,{screen:!1}),b||a.navbar.toggle(!0)}),a.$on("dropEvent",function(b,c,d){if(_.isEqual(c,d))return!1;var e=_.findIndex(f.cells,_.matchesProperty("id",c.id)),g=_.remove(f.cells,c)[0],h=_.findIndex(f.cells,_.matchesProperty("id",d.id));a.navbar.saveorder=!0,h>=e&&h++,f.cells.splice(h,0,g),a.$apply()}),e.screen.orientation.onchange=function(){a.$apply(function(){})}}],controllerAs:"bookcells",link:function(b,c,d,e){b.$watchGroup(["!!bookcells.cells.length",function(){return a.scrollY+a.innerHeight-c[0].clientHeight},function(){return!!a.screen.orientation&&a.screen.orientation.type||(a.innerHeight>a.innerWidth?"portrait":"landscape")}],function(a){var c=b.bookcells.orientation!==a[2];if(c&&(b.bookcells.orientation=a[2],b.bookcells.cols=b.bookcells.orientation.match("portrait")?2:3,b.bookcells.width=100/b.bookcells.cols+"%",b.windows.opened.hasOwnProperty("detail")&&(b.windows.opened.detail="0"),b.tags&&b.tags.reset()),a[0]&&a[1]>-20||c){var d=_.filter(b.bookcells.cells,"scrolled").length,e=Math.ceil(d/b.bookcells.cols)*b.bookcells.cols+b.bookcells.cols;_.each(_.filter(b.bookcells.cells,{toHide:!1,toFilter:!1}).slice(d,e),function(a){a.scrolled=!0})}})}}}]),a.directive("defSrc",["$window","$preloader",function(a,b){return{restrict:"A",link:function(c,d,e){delete c.cell.source,c.$watch("cell.alternative || cell.base64",function(e,f){e&&c.$watch(function(){return(e!==f||!c.cell.source)&&!!d[0].getBoundingClientRect().top&&a.innerHeight>d[0].getBoundingClientRect().top},function(a){a&&b.preloadImages(e).then(function(a){d[0].one(".cover").src=e,c.cell.source=!0})})})}}}])}(),function(){"use strict";var a=angular.module("detail",["search"]);a.directive("detail",function(){return{restrict:"A",templateUrl:"./html/m.detail.html",controller:["$scope","$socket","$thief","$timeout",function(a,b,c,d){var e=a.detail={},f=(a.context={},function(a){var b=c.getColor(a),d="#"+((1<<24)+(b[0]<<16)+(b[1]<<8)+b[2]).toString(16).substr(1);return{rgb:b,hex:d}});e.editToggle=function(a){this.edit[a]=this.edit.able?!this.edit[a]:!1},e.addBook=function(){return this.edit["new"]?(b.emit("newbook",this.book),void(this.edit["new"]=!1)):void a.bookcells.addBook(this.book)},e.updateBook=function(){if(a.windows.close("detail"),this.ref&&(angular.equals(new Date(this.book.publishedDate),this.XDate)||(this.book.publishedDate=this.XDate),!angular.equals(this.ref,this.book))){var c={},d=_.find(a.bookcells.cells,_.matchesProperty("id",this.ref.id)),f=_.find(a.bookcells.collection,_.matchesProperty("id",this.ref.id));_.forEach(this.book,function(a,b){_.isEqual(a,e.ref[b])||(c[b]=a)}),_.assign(this.ref,this.book),c.userComment&&(this.book.userDate=c.userDate=new Date),d&&_.assign(d,c),f&&_.assign(f,c),b.emit("updateBook",_.merge(c,{id:this.book.id})),c.tags&&a.tags.init()}},e.searchBy=function(b){return a.waiting&&a.waiting.anim?!1:(a.search.result={by:b.target.getAttribute("searchby"),search:b.target.html(),lang:"fr"},void a.search.send())},e.uploadCover=function(){document.one("[type=file]").trigger("click")},e.prepare=function(b){var c=_.find(a.bookcells.cells,_.matchesProperty("id",b)),d=angular.copy(_.find(a.bookcells.collection,_.matchesProperty("id",b)));_.assign(a.waiting,{screen:!0,icon:!0}),d||c.updated?e.show(d||c):this.load(c)},e.load=function(c,d){a.windows.close("detail"),_.assign(a.waiting,{screen:!0,icon:!0}),b.emit("searchDetail",d||c.id)},e.setBack=function(){if(e.book&&e.book.alternative||e.book.base64){var a=f(document.one("#detailCover > img")).hex;document.one("#detailCover").css({"background-color":a})}},e.show=function(c){e.reset(),a.navbar.toggle(!1),a.waiting.icon=!1,e.ref=angular.copy(c),e.book=c,e.XDate=e.book.publishedDate?new Date(e.book.publishedDate):null,e.edit.able=_.isPlainObject(e.book.id)&&e.book.id.user===a.profile.user.id,e.book.alternative||e.book.base64||document.one("#detailCover").css({background:"radial-gradient(circle at 50%, whitesmoke 0%, #909090 100%)"}),_.isEmpty(e.book)&&_.assign(e.edit,{able:!0,"new":!0}),d(a.windows.open("detail")).then(function(){document.one("#detailWindow > article").scrollTop=0}),c.id&&!c.id.user&&b.emit("mostAdded",c.id)},e.reset=function(){delete this.ref,delete this.book,delete this.mostAdded,this.edit={able:!1,"new":!1},this.tag=null,document.alls(".new")&&document.alls(".new").toggleClass("new",!1)},e.parseAuthors=function(){this.book.authors=_.uniq(this.book.authors.noSpace().split(","))},e.addTag=function(){this.book.tags||(this.book.tags=[]),-1===this.book.tags.indexOf(this.tag)&&(this.book.tags.push(this.tag),this.book.tags.sort()),this.tag=null},e.byTag=function(b){a.navbar.isCollect&&(a.tags.search(e.book.tags[b]),a.waiting.screen=a.waiting.over=!1)},e.removeTag=function(a){_.pullAt(this.book.tags,a)},e.recommand=function(){a.windows.close("recommand"),b.emit("sendNotif",{recommand:this.recommandTo,id:a.detail.book.id}),this.recommandTo=null},e.noSpace=function(a){this.book[a]=this.book[a].noSpace()},b.on("returnDetail",function(b){var c=_.find(a.bookcells.cells,_.matchesProperty("id",b.id));c&&(c.updated=!0,_.assign(c,b)),a.detail.show(b)}),b.on("returnNotif",function(b){var c=_.find(a.bookcells.cells,_.matchesProperty("id",b.id));c&&(c.updated=!0,_.assign(c,b)),a.detail.show(b)}),b.on("newbook",function(b){_.assign(e.book,b),e.book["new"]=!0,a.bookcells.addBook(e.book)}),b.on("mostAdded",function(a){a.book===e.book.id&&(e.mostAdded=a.mostAdded)}),angular.element(document.one("#detailCover > img")).bind("load",e.setBack),angular.element(document.alls("[searchby]")).bind("click",e.searchBy),angular.element(document.alls(".note")).bind("click",function(b){"1"===e.book.userNote&&"1"===b.target.getAttribute("note")?e.book.userNote="0":e.book.userNote=b.target.getAttribute("note"),a.$apply()})}]}})}(),function(){"use strict";var a=angular.module("defcloak",[]);a.directive("defCloak",["$timeout",function(a){return{restrict:"A",link:{post:function(b,c,d){a(function(){d.$set("defCloak",void 0),c.removeClass("def-cloak")})}}}}])}();