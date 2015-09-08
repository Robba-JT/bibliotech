var google = require("googleapis"),
    OAuth2Client = google.auth.OAuth2,
    gOptions = {
        "gzip": true,
        "headers": {
            "Accept-Encoding": "gzip",
            "Content-Type": "application/json"
        }
    };

google.options(gOptions);

var getToken = function (code, callback) {
    var oauth2Client = new OAuth2Client("216469168993-dqhiqllodmfovgtrmjdf2ps5kj0h1gg9.apps.googleusercontent.com", "lH-1TOOmmd2wNFaXOf2qY3dV", "postmessage");
    oauth2Client.getToken(code, callback);
};

var Auth = function (token) {
    if (!(this instanceof Auth)) { return new Auth(token); }
    var client = new OAuth2Client("216469168993-dqhiqllodmfovgtrmjdf2ps5kj0h1gg9.apps.googleusercontent.com", "lH-1TOOmmd2wNFaXOf2qY3dV", "postmessage");
    if (!!token) { client.setCredentials(token); }
    this.client = client;
    this.getUserInfos = function (callback) { google.oauth2("v2").userinfo.get(client.credentials, callback); };
    this.revokeCredentials = function () { client.revokeCredentials(function (error) { if (!!error) { console.warn(error); }}); };
    return this;
};

exports.getToken = getToken;
exports.Auth = Auth;
