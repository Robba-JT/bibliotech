var nodemailer = require("nodemailer"),
    smtpTransport = nodemailer.createTransport(require("nodemailer-smtp-transport")({
        "host": "mail.gandi.net",
        "port": 465,
        "secureConnection": true,
        "auth": { "user": "admin@biblio.tech", "pass": "robba1979" },
        "debug" : true
    })),
    mailLogin = {
        "from": "Bibliotech ✔ <admin@biblio.tech>",
        "subject": "Nouveau mot de passe ✔",
        "text": "Voici votre nouveau mot de passe: ",
    },
    mailFriend = {
        "from": "Bibliotech ✔ <admin@biblio.tech>",
        "subject": " vous recommande: ",
        "text": "",
    },
    swig = require("swig");

smtpTransport.use("compile", require("nodemailer-plugin-inline-base64"));

module.exports.MailsAPI = MailsAPI = function () {
    "use strict";

    if (!(this instanceof MailsAPI)) { return new MailsAPI(); }

    var sendMail = function (options, callback) {
        smtpTransport.sendMail(options, function (error, success) {
            if (!!error) {
                console.error("sendMail error", error);
                return !!callback ? callback(error) : false;
            }
            console.log("sendMail success", success);
            return !!callback ? callback(null, success) : true;
        });
    };

    this.sendPassword = function (user, name, pwd, callback) {
        var sendOptions = Object.create(mailLogin),
            pwdHtml = swig.renderFile("./tools/password.html", {
                "name": name,
                "password": pwd
            });

        sendOptions.to = user;
        sendOptions.text += pwd;
        sendOptions.html = pwdHtml;

        sendMail(sendOptions, callback);
    };

    this.sendToFriend = function (name, mail, friend, book, callback) {

        var sendOptions = Object.create(mailFriend),
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
        sendOptions.subject = name + "<" + mail + ">" + sendOptions.subject + book.title;
        sendOptions.html = notifHtml;
        sendOptions.text = sendOptions.subject + ". Rendez-vous à l'adresse: \"https://biblio.tech\"";

        sendMail(sendOptions, callback);
    };
};
