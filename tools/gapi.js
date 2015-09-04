var google = require("googleapis"),
    OAuth2Client = google.auth.OAuth2,
    oauthClient = new OAuth2Client("216469168993-dqhiqllodmfovgtrmjdf2ps5kj0h1gg9.apps.googleusercontent.com", "lH-1TOOmmd2wNFaXOf2qY3dV", "postmessage"),
    gOptions = {
        "gzip": true,
        "headers": {
            "Accept-Encoding": "gzip",
            "Content-Type": "application/json",
            "proxy": "http://CGDM-EMEA\jtassin:password_4@isp-ceg.emea.cegedim.grp:3128/"
        }
    },
    merge = require("lodash/object/merge");

google.options(merge({}, gOptions));

exports.client = oauthClient;
/*exports.books = google.books("v1");
exports.oauth = google.oauth2("v2");
exports.options = function (options) { google.options(merge(options || {}, gOptions)); };*/

exports = function Gapi (token) {

    if (!(this instanceof Gapi)) { return new Gapi(token); }

    var options = {}, client = new OAuth2Client("216469168993-dqhiqllodmfovgtrmjdf2ps5kj0h1gg9.apps.googleusercontent.com", "lH-1TOOmmd2wNFaXOf2qY3dV", "postmessage");

    if (!!token) {
        client.setCredentials(token);
        options = { "auth": client };
        this.getUserInfos = function (callback) { google.oauth2("v2").userinfo.get(client.credentials, callback); };
    }

    google.options(merge(options, gOptions));
    this.books = google.books("v1");
    this.revokeCredentials = function () {
        console.log("revoke", client.credentials);
        client.revokeCredentials(function (error) { if (!!error) { console.warn(error); } });
    };
};
