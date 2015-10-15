var google = require("googleapis"),
    Q = require("q"),
    fs = require("fs"),
    googleConfig = JSON.parse(fs.readFileSync("google_client_config.json")).web,
    GoogleAuth = require("google-auth-library"),
    gOptions = {
        "gzip": true,
        "headers": {
            "Accept-Encoding": "gzip",
            "Content-Type": "application/json"
        },
        "proxy": "http://CGDM-EMEA\jtassin:password_4@isp-ceg.emea.cegedim.grp:3128/"
    };

google.options(gOptions);

var getToken = function (code, callback) {
    var auth = new GoogleAuth(),
        oauth2Client = new auth.OAuth2(googleConfig.client_id, googleConfig.client_secret, "postmessage");

    oauth2Client.getToken(code, function (error, token) {
        if (!!error || !token || token.expiry_date < new Date()) { return callback(error || new Error("Invalid token!!!")); }
        return callback(null, token);
    });
};

var getUrl = function () {
    var OAuth2 = google.auth.OAuth2,
        oauth2Client = new OAuth2(googleConfig.client_id, googleConfig.client_secret, "postmessage"),
        scopes = [ "email", "https://www.googleapis.com/auth/books" ];

    return oauth2Client.generateAuthUrl({ "access_type": "offline", "scope": scopes, "approval_prompt": "force" });
};

var Auth = function (token) {
    if (!(this instanceof Auth)) { return new Auth(token); }
    var self = this,
        auth = new GoogleAuth(),
        client = new auth.OAuth2(googleConfig.client_id, googleConfig.client_secret, "postmessage"),
        getUserInfo = function (callback) {
            google.oauth2("v2").userinfo.get(client.credentials, function (error, infos) {
                if (!!error || !infos) {
                    self.revokeCredentials();
                    return callback(error || new Error("No userInfos"));
                }
                callback(null, infos);
            });
        },
        refreshToken = function (callback) {
            if (!client.credentials.refresh_token) {
                self.revokeCredentials();
                return callback(new Error("No refresh token!!!"));
            }
            if (client.credentials.expiry_date < new Date()) { return callback(null); }
            client.refreshAccessToken(function (error, token) {
                if (!!error || !token) {
                    self.revokeCredentials();
                    return callback(error || new Error("Error refreshing token!!!"));
                }
                token.expiry_date = new Date(token.expiry_date);
                client.setCredentials(token);
                callback(null);
            });
        },
        revokeCredentials = function () { client.revokeCredentials(function (error) { if (!!error) { console.error("revokeCredentials error", error); }}); };

    this.getUserInfo = getUserInfo;
    this.revokeCredentials = revokeCredentials;
    this.client = client;
    this.refreshToken = refreshToken;

    return new Q.Promise(function (resolve, reject) {
        client.setCredentials(token);
        self.refreshToken(function (error) {
            if (!!error) {
                console.log("Auth refresh", error);
                reject(error);
            } else { resolve(self); }
        });
    });
};

exports.getToken = getToken;
exports.Auth = Auth;
exports.getUrl = getUrl;
