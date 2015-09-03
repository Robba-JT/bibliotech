var google = require("googleapis"),
    OAuth2Client = google.auth.OAuth2,
    gAuth = google.oauth2({ version: "v2" }),
    merge = require("lodash/object/merge"),
    gOptions = {
        "gzip": true,
        "headers": {
            "Accept-Encoding": "gzip",
            "Content-Type": "application/json"
        }
    };

google.options(merge({}, gOptions));

module.exports = (function () {
    var instance,
        Oauth = function () {
            oauthClient = new OAuth2Client("216469168993-dqhiqllodmfovgtrmjdf2ps5kj0h1gg9.apps.googleusercontent.com", "lH-1TOOmmd2wNFaXOf2qY3dV", "postmessage")
        },
        get = function () {
            if (!instance) { instance = new Oauth(); }
            return instance;
        },
        destroy = function (callback) {
            oauthClient.revokeCredentials(function (error) {
                instance = null;
                google.options(merge({}, gOptions));
                callback(error);
            });
        };

    Oauth.prototype.getCredentials = function () { return oauthClient.credentials; };
    Oauth.prototype.setCredentials = function (token) {
        oauthClient.setCredentials(token);
        google.options(merge({ "auth": oauthClient }, gOptions));
    };
    Oauth.prototype.userInfos = function (callback) {
        if (!oauthClient.credentials) { return callback(new Error("No credential!!!")); }
        gAuth.userinfo.v2.me.get(oauthClient.credentials, callback);
    };
    Oauth.prototype.getToken = function (code, callback) {
        oauthClient.getToken(code, function (error, token) {
            if (!!error) { callback(error); } else {
                callback(null, token);
            }
        });
    };
    return { get: get, destroy: destroy };
})();
