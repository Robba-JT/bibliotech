!function(){var a=angular.module("profile",[]);a.directive("profile",function(){return{restrict:"A",templateUrl:"./html/directives/profile.html",controller:["$scope","$socket","$idb",function(a,b,c){var d=a.profile={};d.reset=function(){_.assign(this.user,{pwd:"",newPwd:"",confirmPwd:"",error:!1})},d.send=function(){b.emit("updateUser",this.user)},d["delete"]=function(){b.emit("deleteUser",this.user),a.windows.close("*")},d["import"]=function(){b.emit("importNow"),a.windows.close("*"),_.assign(a.waiting,{screen:!0,icon:!0,anim:!0})},d["export"]=function(){b.emit("exportNow"),a.windows.close("*"),_.assign(a.waiting,{screen:!0,icon:!0})},b.on("user",function(b){a.waiting.screen=!1,d.user=b,b.link&&b.picture&&!µ.one("#picture").isVisible()&&µ.one("#picture").css({"background-image":"url("+b.picture+")"}).setEvents("click",function(){window.open(b.link)}).toggleClass("notdisplayed",!1),b.connex||a.windows.open("help"),b.session&&c.init(b.session)}),b.on("updateUser",function(b){_.assign(d.user,b),a.windows.close("profile"),d.reset()}),b.on("updateNok",function(){d.reset(),d.user.error=!0})}]}})}();
