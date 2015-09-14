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
    },
    swig = require("swig");

module.exports.MailsAPI = MailsAPI = function () {
    "use strict";

    if (!(this instanceof MailsAPI)) {
        console.log("Warning: MailsAPI constructor called without 'new' operator");
        return new MailsAPI();
    }

    var sendMail = function (options, callback) { smtpTransport.sendMail(options, callback); };

    this.sendPassword = function (user, name, pwd, callback) {
        var sendOptions = mailLogin,
            pwdHtml = swig.renderFile("./tools/password.html", {
                "name": name,
                "password": pwd
            });

        sendOptions.to = user;
        sendOptions.text += pwd;
        sendOptions.html = pwdHtml;
        sendMail(sendOptions, callback);
    };

    this.sendToFriend = function (name, friend, book, callback) {

        var sendOptions = mailFriend,
            index = book.description.indexOf(" ", 500),
            notifHtml = swig.renderFile("./tools/notif.html", {
                "title": book.title,
                "description": book.description.substr(0, Math.max(index, 500)) + ((index !== -1) ? "..." : ""),
                "source": book.base64 || book.alternative,
                "name": !!book.userComment || !!book.userNote ? name + ":" : "",
                "note": !!book.userNote ? "Note: " + book.userNote : "",
                "comment": !!book.userComment ? "\"" + book.userComment + "\"" : ""
            });

        sendOptions.to = friend;
        sendOptions.subject = name + sendOptions.subject + book.title;
        sendOptions.html = notifHtml;
        sendOptions.text = sendOptions.subject + ". Pour vous inscrire, rendez-vous à l'adresse: \"https://biblio.tech\"";

        sendMail(sendOptions, callback);
    };
};
