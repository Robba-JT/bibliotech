if(window.FileReader&&"formNoValidate"in document.createElement("input")){var µ=document,app=angular.module("bibliotech",[]);app.config(["$interpolateProvider","$sceProvider",function(a,b){"use strict";a.startSymbol("[{"),a.endSymbol("}]"),b.enabled(!1)}]),app.run(["$rootScope","$http",function(a,b){"use strict";b.post("/trad",{from:"login"}).then(function(b){a.trads=b.data})}]),app.directive("compareTo",["$rootScope",function(a){"use strict";return{restrict:"A",require:"ngModel",scope:{otherModelValue:"=compareTo",notEquals:"@"},link:function(b,c,d,e){e.$validators.compareTo=function(c){return a["new"]?b.notEquals?c!==b.otherModelValue:c===b.otherModelValue:!0},b.$watch("otherModelValue",function(){e.$validate()})}}}]),app.directive("login",["$timeout",function(a){"use strict";return{restrict:"A",templateUrl:"./html/form.html",link:function(b,c,d){a(function(){c.removeClass("notdisplayed"),b.ready=!0})},controller:["$scope","$http","$window",function(a,b,c){var d=a.user={},e=function(){delete a.error,delete a.success};a.submit=function(){a.ready=!1,e(),b.post(this["new"]?"/new":"/login",d).then(function(b){b.data&&b.data.success?c.location.reload(!0):(a.error=b.data.error,d.password=null,a.ready=!0)})},angular.element(µ.one("[type=button]")).bind("click",function(){e(),d.name=null,d.confirm=null,a["new"]=!a["new"],a.$apply()}),angular.element(µ.one("#f")).bind("click",function(){window.location="/gAuth"}),angular.element(µ.one(".m")).bind("click",function(){e(),a.ready=!1,b.post("/mail",d).then(function(b){a.ready=!0,a.error=b.data.error,a.success=b.data.success})})}]}}])}else document.getElementsByClassName("k")[0].parentNode.style.display="none";
