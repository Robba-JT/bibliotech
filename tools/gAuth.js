var google = require("googleapis"),
    Q = require("q"),
    fs = require("fs"),
    OAuth2Client = google.auth.OAuth2,
    googleConfig = JSON.parse(fs.readFileSync("google_client_config.json")).web,
    gOptions = {
        "gzip": true,
        "headers": {
            "Accept-Encoding": "gzip",
            "Content-Type": "application/json"
        }
    };

google.options(gOptions);

var getToken = function (code, callback) {
    var oauth2Client = new OAuth2Client(googleConfig.client_id, googleConfig.client_secret, "postmessage");
    oauth2Client.getToken(code, callback);
};

var Auth = function (token) {
    if (!(this instanceof Auth)) { return new Auth(token); }
    var client = new OAuth2Client(googleConfig.client_id, googleConfig.client_secret, "postmessage");
    if (!!token) { client.setCredentials(token); }
    this.client = client;
    this.getUserInfos = function (callback) { google.oauth2("v2").userinfo.get(client.credentials, callback); };
    return this;
};

exports.getToken = getToken;
exports.Auth = Auth;
