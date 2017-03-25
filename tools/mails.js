const nodemailer = require("nodemailer"),
    _ = require("lodash"),
    console = require("./console"),
    config = require("nconf").get("config"),
    smtpTransport = nodemailer.createTransport(require("nodemailer-smtp-transport")({
        "service": "gmail",
        "auth": {
            "user": "robba.jt@gmail.com",
            "pass": config.passPhrase
        },
        "debug": true
    })),
    mailLogin = {
        "from": "Bibliotech ✔ <admin@biblio.tech>",
        "subject": "Nouveau mot de passe ✔",
        "text": "Voici votre nouveau mot de passe: "
    },
    mailFriend = {
        "from": "Bibliotech ✔ <admin@biblio.tech>",
        "subject": " vous recommande: ",
        "text": ""
    },
    swig = require("swig"),
    MailsAPI = function () {
        if (!(this instanceof MailsAPI)) {
            return new MailsAPI();
        }
        const sendMail = (options, callback) => smtpTransport.sendMail(options, (error, success) => {
            if (error) {
                console.error("sendMail error", error);
            } else {
                console.log("sendMail success", success);
            }
            if (_.isFunction(callback)) {
                callback(error, success);
            }
        });

        this.sendPassword = (...args) => {
            const {
                user,
                name,
                pwd,
                callback
            } = args,
            sendOptions = _.create(mailLogin),
                pwdHtml = swig.renderFile("./mails/password.html", {
                    name,
                    "password": pwd
                });

            sendOptions.to = user;
            sendOptions.text += pwd;
            sendOptions.html = pwdHtml;
            sendMail(sendOptions, callback);
        };

        this.sendToFriend = (...args) => {
            const {
                name,
                mail,
                friend,
                book,
                callback
            } = args,
            sendOptions = _.create(mailFriend),
                index = book.description.indexOf(" ", 500),
                notifHtml = swig.renderFile("./mails/notif.html", {
                    "title": book.title,
                    "description": _.concat(book.description.substr(0, Math.max(index, 500)), index > -1 ? "..." : ""),
                    "source": book.base64 || book.alternative,
                    "name": _.concat(name, book.userComment || book.userNote ? ":" : ""),
                    "note": book.userNote ? `Note: ${book.userNote}` : "",
                    "comment": book.userComment ? `"${book.userComment}"` : ""
                });

            sendOptions.to = friend;
            sendOptions.subject = `${name} <${mail}>${sendOptions.subject}${book.title}`;
            sendOptions.html = notifHtml;
            sendOptions.text = `${sendOptions.subject}. Rendez-vous à l'adresse: "https://biblio.tech"`;
            sendMail(sendOptions, callback);
        };

        return this;
    };

smtpTransport.use("compile", require("nodemailer-plugin-inline-base64"));

exports = module.exports = new MailsAPI();
