var start=new Date,app=angular.module("admin",["preloader","socket","defcloak"]);app.config(["$interpolateProvider","$sceProvider",function(a,b,c){a.startSymbol("[{"),a.endSymbol("}]"),b.enabled(!1)}]),app.run(["$rootScope","$http","$window","$timeout","$socket","$preloader",function(a,b,c,d,e,f){"use strict";a.logout=function(){return e.close(),location.assign("/logout"),!1},a.orders={},a.show={},e.on("users",function(b){a.ref_user=b,a.users=angular.copy(b)}),e.on("sessions",function(b){a.ref_session=b,a.sessions=angular.copy(b)}),e.on("books",function(b,c){a.ref_book=b,a.ref_perso=c,a.books=angular.copy(b),a.persos=angular.copy(c)}),e.on("covers",function(b){a.covers=b,_.forEach(b,function(a){f.preloadImages(a.cover).then(function(){a.source={"background-image":"url("+a.cover+")"}})})}),e.on("comments",function(b){a.ref_comment=b,a.comments=angular.copy(b)}),e.on("notifications",function(b){a.ref_notification=angular.copy(b),a.notifications=b}),e.on("logs",function(b){a.logs=b}),angular.element(document.alls("h2 .titre")).bind("click",function(){a.$apply(a.show[this.parentNode.parentNode.getAttribute("type")]=!a.show[this.parentNode.parentNode.getAttribute("type")])}),angular.element(document.one("#logout")).bind("click",function(){a.logout()}),angular.element(document.one("#footer")).bind("click",function(){var a=setInterval(function(){var b=((c.scrollY||document.documentElement.scrollTop)/2-.1).toFixed(1);c.scroll(0,b),.1>=b&&(c.scroll(0,0),clearInterval(a))},100)}),angular.element(document.alls("[field]")).bind("click",function(){var b=this.parentNode.parentNode.getAttribute("type"),c=this.getAttribute("field");a.orders[c]=!a.orders[c],a[b]=_.sortBy(a[b],c),a.orders[c]&&a[b].reverse(),a.$apply()}),angular.element(c).bind("scroll",function(){a.$apply(a.footer=c.scrollY||document.documentElement.scrollTop)}),angular.element(document.one("h1 div")).bind("click",function(){d(function(){delete a.users,delete a.sessions,delete a.books,delete a.persos,delete a.covers,delete a.comments,delete a.notifications,delete a.logs}).then(function(){e.emit("isConnected")})})}]),app.directive("submit",["$socket",function(a){"use strict";return{restrict:"A",link:{post:function(b,c,d){var e=_.find(_.keys(b),function(a){return!_.startsWith(a,"$")}),f=b[e],g=_.find(b.$parent["ref_"+e],_.matchesProperty("_id",b[e]._id));c.on("click",function(){a.emit("update",{collection:e+"s",values:f}),delete f.newPassword,g=angular.copy(f),b.$apply(b.disable=!0)}),b.$watch(function(){return b[e]},function(){b.disable=angular.equals(f,g)},!0)}}}}]),app.directive("delete",["$socket",function(a){"use strict";return{restrict:"A",link:function(b,c,d){var e=_.find(_.keys(b),function(a){return!_.startsWith(a,"$")});c.on("click",function(){a.emit("delete",{collection:e+"s",_id:b[e]._id}),b.$apply(_.remove(b.$parent[e+"s"],b[e]))})}}}]),function(){"use strict";var a=angular.module("preloader",[]);a.factory("$preloader",["$q","$rootScope","$http",function(a,b,c){var d=function(b){this.imageLocations=b,this.imageCount=this.imageLocations.length,this.loadCount=0,this.errorCount=0,this.states={PENDING:1,LOADING:2,RESOLVED:3,REJECTED:4},this.state=this.states.PENDING,this.deferred=a.defer(),this.promise=this.deferred.promise};return d.preloadImages=function(a){Array.isArray(a)||(a=[a]);var b=new d(a);return b.load()},d.prototype={constructor:d,isInitiated:function(){return this.state!==this.states.PENDING},isRejected:function(){return this.state===this.states.REJECTED},isResolved:function(){return this.state===this.states.RESOLVED},load:function(){if(this.isInitiated())return this.promise;this.state=this.states.LOADING;for(var a=0;a<this.imageCount;a++)this.loadImageLocation(this.imageLocations[a]);return this.promise},handleImageError:function(a){this.errorCount++,this.isRejected()||(this.state=this.states.REJECTED,this.deferred.reject(a))},handleImageLoad:function(a){this.loadCount++,this.isRejected()||(this.deferred.notify({percent:Math.ceil(this.loadCount/this.imageCount*100),imageLocation:a}),this.loadCount===this.imageCount&&(this.state=this.states.RESOLVED,this.deferred.resolve(this.imageLocations)))},loadImageLocation:function(a){var c=this,d=new Image;d.onload=function(a){b.$apply(function(){c.handleImageLoad(a.target.src),c=d=a=null})},d.onerror=function(a){b.$apply(function(){c.handleImageError(a.target.src),c=d=a=null})},d.src=a}},d}])}(),function(){"use strict";var a=angular.module("socket",[]);a.factory("$socket",["$rootScope","$timeout",function(a,b){var c={on:[],emit:[]},d=function(){var b=function(b,c){f.on(b,function(){var b=arguments;a.$apply(function(){c.apply(f,b)})})},d=function(){if(!document.body.getAttribute("page"))return location.assign("/logout");var d=window.location.origin||window.location.protocol+"//"+window.location.host,g=io.connect(d+"/"+document.body.getAttribute("page"),{secure:!0,multiplex:!1,reconnection:!1});return g.on("error",function(b){a.logout()}).once("connect",function(){this.emit("isConnected"),start=new Date,_.isFunction(c.connect)&&c.connect.apply(),this.once("disconnect",function(a){e(this),_.isFunction(c.disconnect)&&c.disconnect.apply()}),this.on("logout",a.logout);for(var d=0,g=c.on.length;g>d;d++)b(c.on[d].event,c.on[d].callback);for(d=0,g=c.emit.length;g>d;d++)f.emit(c.emit[d].event,c.emit[d].data);c.emit.length=0}),g},e=function(a){var b=setInterval(function(){a&&a.connected&&"open"===a.io.readyState&&(clearInterval(b),a.destroy(),f=d());try{a.connect()}catch(c){}},3e3)},f=d();return{on:function(a,d){f&&f.connected?b(a,d):c.on.push({event:a,callback:d})},connect:function(a){c.connect=a,f&&f.connected&&a.apply()},disconnect:function(a){c.disconnect=a,f&&f.connected&&f.once("disconnect",a)},emit:function(a,b){f&&f.connected?f.emit(a,b):c.emit.push({event:a,data:b})},close:function(){f.close()}}}();return d}])}(),function(){"use strict";var a=angular.module("defcloak",[]);a.directive("defCloak",["$timeout",function(a){return{restrict:"A",link:{post:function(b,c,d){a(function(){d.$set("defCloak",void 0),c.removeClass("def-cloak")})}}}}])}();