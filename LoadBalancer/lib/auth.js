"use strict";
exports.__esModule = true;
const {google} = require("googleapis");
const SCOPES = [
    "https://www.googleapis.com/auth/drive"
];
async function authorize(credentials, type, code = "") {
    return await new Promise((resolve,reject) => {
        const {client_secret, client_id, redirect_uris} = credentials.installed;
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
        if(type == "generateAuth") {
            const authUrl = oAuth2Client.generateAuthUrl({
                access_type: "offline",
                scope: SCOPES,
            });
            resolve(authUrl);
        } else if(type == "getAccessToken") {
            oAuth2Client.getToken(code, (err, token) => {
                if (err) reject(err);
                oAuth2Client.setCredentials(token);
                var data = JSON.stringify(token);
                resolve(data);
            });
        }
    });
}
module.exports = authorize;