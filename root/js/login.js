$(document).ready(function(){"use strict";if(!(window.FileReader&&"formNoValidate"in document.createElement("input")))return alert("Veuillez installer une version plus récente de votre navigateur!!!"),!1;var a=function(){$(".e").removeClass("e"),$(".g").fadeIn().text("")},b=function(){var a;switch(this.setCustomValidity(""),this.name){case"b":a=this.value.length<4;break;case"c":a=this.value.length<4||this.value.length>12;break;case"d":a=this.value!==$("[name=c]").val()}a&&this.setCustomValidity($(this).attr("m"))};$.fn.l=function(a){$(this).each(function(){$(this).val($(this).attr(a?"k":"j"))})},$("[type=text], [type=password]").on("input propertychange",b),$("form").submit(function(b){b.preventDefault(),a(),$("div").fadeIn(),$.ajax({url:$("[h]").is(":visible")?"/new":"/login",method:"post",data:$(this).serialize(),success:function(a){return a.success?window.location.reload(!0):($("[type=email], [type=password], [type=text]").addClass("e"),$("div").fadeOut(),$("[name=a]").focus(),$(".g").text(a.error).fadeOut("slow"),!1)}})}),$("[type=email],[type=password]").change(a),$("[type=button]").click(function(){a(),$("[h]").val("").fadeToggle(function(){$("[j]").l($("[h]").is(":visible")),$("[h]").attr("required",$("[h]").is(":visible")),$("[type=email]").focus()})}),$("[j]").l(),$("#f").click(function(){$("div").fadeIn()}),gapi.signin.render("f",{clientid:"216469168993-dqhiqllodmfovgtrmjdf2ps5kj0h1gg9.apps.googleusercontent.com",cookiepolicy:"none",scope:"https://www.googleapis.com/auth/plus.me https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/books",width:"wide",redirecturi:"postmessage",accesstype:"offline",callback:function(a){a.code&&$.ajax({url:"/googleAuth",method:"post",data:{code:a.code},success:function(b){return b.success?window.location.reload(!0):($("div").fadeOut(),$(".e").text(a.error).fadeOut(),!1)}})}})});
