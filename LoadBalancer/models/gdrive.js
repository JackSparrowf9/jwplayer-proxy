"use strict";
exports.__esModule = true;
const {google} = require("googleapis");
var authorize = (function () {
	function authorize(credentials, token) {
		let {client_secret, client_id, redirect_uris} = credentials.installed;
		var oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
		oAuth2Client.setCredentials(token);
		return oAuth2Client.credentials.access_token;
	}
	return authorize;
}());
exports.authorize = authorize;