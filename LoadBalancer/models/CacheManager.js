"use strict";
exports.__esModule = true;
var crypto = require('crypto');
var fs = require('fs');
var CacheManager = (function () {
    function CacheManager() {
        this.checkAliveCookies();
        fs.watchFile(CacheManager.fileCookies, function (err) {
            try {
                CacheManager.aliveCookies = JSON.parse(fs.readFileSync(CacheManager.fileCookies));
            }
            catch (e) {
            }
        });
    }
    CacheManager.getCookieLive = function () {
        if (this.aliveCookies.length == 0)
            return null;
        else
            return this.aliveCookies[new Date() % this.aliveCookies.length];
    };
    CacheManager.prototype.checkAliveCookies = function () {
        setInterval(function () {
            var time = new Date().getTime();
            var unlocks = [];
            for (var t in CacheManager.blockCookies) {
                if (time - t > 24 * 60 * 60 * 1000) {
                    CacheManager.aliveCookies.push(CacheManager.blockCookies[t]);
                    unlocks.push(t);
                }
            }
            for (var _i = 0, unlocks_1 = unlocks; _i < unlocks_1.length; _i++) {
                var t = unlocks_1[_i];
                delete CacheManager.blockCookies[t];
            }
        }, 5 * 1000 * 60);
    };
    CacheManager.doblockCookies = function (cookies) {
        this.blockCookies[new Date().getTime()] = cookies;
        this.aliveCookies = this.aliveCookies.filter(function (c) {
            return c != cookies;
        });
    };
    return CacheManager;
}());
CacheManager.KEY_ENCRYPT = 'yourkeyhere';
CacheManager.encrypt = function (text) {
    var cipher = crypto.createCipher('aes-256-ctr', CacheManager.KEY_ENCRYPT);
    var crypted = cipher.update(text, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
};
CacheManager.decrypt = function (text) {
    var decipher = crypto.createCipher('aes-256-ctr', CacheManager.KEY_ENCRYPT);
    var dec = decipher.update(text, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
};
exports.CacheManager = CacheManager;
