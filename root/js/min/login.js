$(document).ready(function(){"use strict";$("form").submit(function(a){return a.preventDefault(),$("input").removeClass("error"),$(".waiting").show(),$("[new=true]").is(":visible")&&$("#pwd").val()!==$("[name=pwd]").val()?($("[type=password]").addClass("error"),alert("les mots de passe ne sont pas identiques!!!")):void $.ajax({url:$("[new=true]").is(":visible")?"/new":"/login",method:"post",data:$(this).serialize(),success:function(a){return a.success?window.location.reload(!0):($("[type=email], [type=password], [type=text]").addClass("error"),$(".waiting").hide(),$("[name=login]").focus(),alert(a.error),!1)}})}),$("[type=button]").click(function(a){$("[new=true]").val("").toggle("slow",function(){$("[type=button]").val($("[new=true]").is(":visible")?"Annuler":"Créer compte"),$("[type=submit]").val($("[new=true]").is(":visible")?"Valider":"Connexion"),$("[new=true]").attr("required",$("[new=true]").is(":visible")),$("[type=email]").focus()})}),gapi.signin.render("gSignIn",{clientid:"216469168993-dqhiqllodmfovgtrmjdf2ps5kj0h1gg9.apps.googleusercontent.com",cookiepolicy:"none",scope:"https://www.googleapis.com/auth/plus.me https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/books",width:"wide",redirecturi:"postmessage",accesstype:"offline",callback:function(a){a.code&&$.ajax({url:"/googleAuth",method:"post",data:{code:a.code},success:function(a){return a.success?window.location.reload(!0):!1}})}})});
