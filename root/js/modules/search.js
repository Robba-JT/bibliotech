!function(){var a=angular.module("search",[]);a.directive("search",function(){return{restrict:"A",templateUrl:"./html/directives/search.html",controller:["$scope","$socket","$idb",function(a,b,c){var d=a.search={result:{search:"",by:"",lang:"fr"}};d.reset=function(){d.result={search:"",by:"",lang:"fr"}},d.send=function(){a.windows.close("*"),a.navbar.isCollect=!1,a.navbar.filtre=d.last=a.tags.last=null,µ.one(".sortBy")&&µ.one(".sortBy").toggleClass("sortBy",!1),_.isEqual(this.result,this.last)||(this.last=this.result,a.bookcells.reset(),c.getQuery(this.result).then(function(b){d.reset(),a.bookcells.cells=b,_.assign(a.waiting,{screen:!1,icon:!1,anim:!1})})["catch"](function(){b.emit("searchBooks",d.last),d.reset()}))},d.associated=function(){var e={associated:a.detail.book.id,search:a.detail.book.title};a.windows.close("*"),a.navbar.isCollect=!1,a.navbar.filtre=d.last=a.tags.last=null,µ.one(".sortBy")&&µ.one(".sortBy").toggleClass("sortBy",!1),_.isEqual(e,this.last)||(this.last=e,a.bookcells.reset(),c.getQuery(e).then(function(b){d.reset(),d.cells=b,_.assign(a.waiting,{screen:!1,icon:!1,anim:!1})})["catch"](function(){b.emit("associated",e.associated),d.reset()}))},d.recommanded=function(){var e={recommand:a.profile.user.id,search:a.trads.recommand4u};a.windows.close("*"),a.navbar.isCollect=!1,a.navbar.filtre=d.last=a.tags.last=null,µ.one(".sortBy")&&µ.one(".sortBy").toggleClass("sortBy",!1),_.isEqual(e,d.last)||(d.last=e,a.bookcells.reset(),c.getQuery(e).then(function(b){d.reset(),a.bookcells.cells=b,_.assign(a.waiting,{screen:!1,icon:!1,anim:!1})})["catch"](function(){b.emit("recommanded"),d.reset()}))}}]}})}();