$(document).ready(function () {
    "use strict";
    $("form").submit(function (event) {
		event.preventDefault();
		$("input").removeClass("error");
		$(".waiting").show();
        if ($("[new=true]").is(":visible") && $("#pwd").val() !== $("[name=pwd]").val()) {
            $("[type=password]").addClass("error");
            return alert("les mots de passe ne sont pas identiques!!!");
        }
        $.ajax({
            url: ($("[new=true]").is(":visible")) ? "/new" : "/login",
            method: "post",
            data: $(this).serialize(),
            success: function (response) {
                if (!!response.success) { return window.location.reload(true); }
                $("[type=email], [type=password], [type=text]").addClass("error");
                $(".waiting").hide();
                $("[name=login]").focus();
                alert(response.error);
                return !1;
            }
        });
	});

    $("[type=button]").click(function (event) {
        $("[new=true]").val("").toggle("slow", function () {
            $("[type=button]").val(($("[new=true]").is(":visible")) ? "Annuler" : "Créer compte");
            $("[type=submit]").val(($("[new=true]").is(":visible")) ? "Valider" : "Connexion");
            $("[new=true]").attr("required", $("[new=true]").is(":visible"));
            $("[type=email]").focus();
        });
    });

    gapi.signin.render("gSignIn", {
        clientid: "216469168993-dqhiqllodmfovgtrmjdf2ps5kj0h1gg9.apps.googleusercontent.com",
        cookiepolicy: "none",
        scope: "https://www.googleapis.com/auth/plus.me https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/books",
        width: "wide",
        redirecturi: "postmessage",
        accesstype: "offline",
        callback: function (response) {
            if (!response.code) { return; }
            $.ajax({
                url: "/googleAuth",
                method: "post",
                data: { code: response.code },
                success: function (ret) {
                    if (!!ret.success) { return window.location.reload(true); }
                    return !1;
                }
            });
        }
    });
});
