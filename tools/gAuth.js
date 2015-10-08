var google = require("googleapis"),
    Q = require("q"),
    fs = require("fs"),
    googleConfig = JSON.parse(fs.readFileSync("google_client_config.json")).web,
    googleAuth = require("google-auth-library"),
    gOptions = {
        "gzip": true,
        "headers": {
            "Accept-Encoding": "gzip",
            "Content-Type": "application/json"
        }
    };

google.options(gOptions);

var getToken = function (code, callback) {
    var auth = new googleAuth(),
        oauth2Client = new auth.OAuth2(googleConfig.client_id, googleConfig.client_secret, "postmessage");

    oauth2Client.getToken(code, function (error, token) {
        if (!!error || !token || token.expiry_date < new Date()) { return callback(error || new Error("Invalid token!!!")); }
        return callback(null, token);
    });
};

var Auth = function (token) {
    if (!(this instanceof Auth)) { return new Auth(token); }
    var self = this,
        auth = new googleAuth(),
        client = new auth.OAuth2(googleConfig.client_id, googleConfig.client_secret, "postmessage"),
        getUserInfo = function (callback) {
            google.oauth2("v2").userinfo.get(client.credentials, function (error, infos) {
                if (!!error || !infos) {
                    client.revokeCredentials();
                    return callback(error || new Error("No userInfos"));
                }
                callback(null, infos);
            });
        },
        oauth = new Q.Promise(function (resolve) {
            client.setCredentials(token);
            if (token.refresh_token) {
                client.refreshAccessToken(function (error, new_token) {
                    if (!!error || !token) { return console.error(error || new Error("No refresh token!!!")); }
                    client.setCredentials(new_token);
                    resolve(self);
                });
            } else { resolve(self); }
        }),
        refreshToken = function (callback) {
            client.refreshAccessToken(function (error, token) {
                if (!!error || !token) { return callback(error || new Error("No refresh token!!!")); }
                callback(null, token);
            });
        },
        revokeCredentials = function () { client.revokeCredentials(function (error) { if (!!error) { console.error("revokeCredentials error", error); }}); };

    this.getUserInfo = getUserInfo;
    this.revokeCredentials = revokeCredentials;
    this.client = client;
    this.refreshToken = refreshToken;

    return oauth;
};

exports.getToken = getToken;
exports.Auth = Auth;
