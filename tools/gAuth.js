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

var Auth = function () {
    if (!(this instanceof Auth)) { return new Auth(); }
    var client = new OAuth2Client(googleConfig.client_id, googleConfig.client_secret, "postmessage");
    this.client = client;
    this.getUserInfos = function (token, callback) {
        google.oauth2("v2").userinfo.get(token, function (error, infos) {
            if (!!error || !infos) { return callback(error || new Error("No userInfos")); }
            client.setCredentials(token);
            callback(null, infos);
        });
    };
    this.revokeCredentials = function () { client.revokeCredentials(function (error) { if (!!error) { console.error("revokeCredentials error", error); }}); };
    this.refreshToken = function (callback) {
        console.log(client.credentials);
        client.refreshAccessToken(function (error, token) {
            if (!!error || !token) { return callback(error || new Error("No refresh token!!!")); }
            console.log("token", token);
            console.log("client.credentials", client.credentials);
            callback();
        });
    };
    return this;
};

exports.getToken = getToken;
exports.Auth = Auth;
