"use strict";
exports.__esModule = true;
var Promise = require('bluebird');
var CacheManager_1 = require("./CacheManager");
var ClientRequestManager = (function () {
    function ClientRequestManager() {
    }
    ClientRequestManager.prototype.getHashData = function (hash, cookie) {
        return new Promise(function (resolve, reject) {
            var link 		= CacheManager_1.CacheManager.decrypt(hash);
            var cookies 	= cookie;
			return resolve({ link: link, cookies: cookies });
        });
    };
    return ClientRequestManager;
}());
exports.ClientRequestManager = ClientRequestManager;
