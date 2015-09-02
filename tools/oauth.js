var google = require("googleapis"),
    OAuth2Client = google.auth.OAuth2,
    gAuth = google.oauth2({ version: "v2" });

module.exports.Oauth = Oauth = (function () {
    var instance,
        Oauth = function () {},
        oauthClient = new OAuth2Client("216469168993-dqhiqllodmfovgtrmjdf2ps5kj0h1gg9.apps.googleusercontent.com", "lH-1TOOmmd2wNFaXOf2qY3dV", "postmessage"),
        get = function () {
            if (!instance) { instance = new Oauth(); }
            return instance;
        },
        destroy = function (callback) {
            oauthClient.revokeCredentials(function (error) {
                instance = null;
                google.options({
                    "gzip": true,
                    "headers": { "Accept-Encoding": "gzip" },
                    "proxy": "http://CGDM-EMEA\jtassin:password_4@isp-ceg.emea.cegedim.grp:3128/"
                });
                callback(error);
            });
        };

    Oauth.prototype.setCredentials = function (token) {
        oauthClient.setCredentials(token);
        google._options.auth = oauthClient;
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
