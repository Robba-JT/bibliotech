var nodemailer = require("nodemailer"),
    smtpTransport = nodemailer.createTransport(require("nodemailer-smtp-transport")({
        "service": "Gmail",
        "auth": { "user": "robba.jt@gmail.com", "pass": "robba1979" },
        "debug" : true
    })),
    mailLogin = {
        "from": "Bibliotech ✔ <admin@biblio.tech>",
        "subject": "Nouveau mot de passe ✔",
        "text": "Voici votre nouveau mot de passe: ",
        "html": "<b>Voici votre nouveau mot de passe:</b> "
    },
    mailFriend = {
        "from": "Bibliotech ✔ <admin@biblio.tech>",
        "subject": " vous recommande: ",
        "text": "",
        "html": ""
    };

module.exports.MailsAPI = MailsAPI = function () {
    "use strict";

    if (!(this instanceof MailsAPI)) {
        console.log("Warning: MailsAPI constructor called without 'new' operator");
        return new MailsAPI();
    }

    var sendMail = function (options, callback) { smtpTransport.sendMail(options, callback); };

    this.sendPassword = function (user, pwd, callback) {
        var sendOptions = mailLogin;
        sendOptions.to = user;
        sendOptions.text += pwd;
        sendOptions.html += pwd;
        sendMail(sendOptions, callback);
    };

    this.sendToFriend = function (name, friend, title, source, callback) {
        var sendOptions = mailFriend;
        sendOptions.to = friend;
        sendOptions.subject = name + sendOptions.subject + title;
        sendOptions.html = "<div>";
        if (!!source) { sendOptions.html += "<img style='width: 256px;' src='" + source + "'></img>"; }
        sendOptions.html += "<legend style='text-align: center;'><b>" + title + "</b></legend></div>";
        sendOptions.html += "<BR><BR>Cliquer ici pour vous inscrire à <a href='http://localhost:5678'>Bibliotech</a>";
        sendOptions.text += title + ". Pour vous inscrire, rendez-vous à l'adresse: 'http://localhost:5678'";
        sendMail(sendOptions, callback);
    };
};
