"use strict";
exports.__esModule = true;
var GoogleDriveGeter_1 = require("./GoogleDriveGeter");
var CacheManager_1 = require("./CacheManager");
var servers_1 = require("../configs/servers");
var Promise = require('bluebird');
var MyGatewayRequestManager = (function () {
    function MyGatewayRequestManager() {
    }
    MyGatewayRequestManager.prototype.getOurLinksFromGoogleLinks = function (googleLinks) {
        var ourLinks = [];
        for (var _i = 0, _a = googleLinks.linkPlays; _i < _a.length; _i++) {
            var link = _a[_i];
            var hash 		= CacheManager_1.CacheManager.encrypt(link.link);
            var hashCookie 	= link.cookies;
            ourLinks.push({ 'file': '/video.mp4?hash=' + hash + '&cookie=' + hashCookie, 'label': link.quantity});
        }
        return ourLinks;
    };
    MyGatewayRequestManager.prototype.getOurLinks = function (driveId) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var ourLinks = _this.initNewOurAndGoogleLinks(driveId)
                .then(function (ourLinks) {
                resolve(ourLinks);
            })["catch"](reject);
        });
    };
    MyGatewayRequestManager.prototype.initNewOurAndGoogleLinks = function (driveId) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var googleGeter = new GoogleDriveGeter_1.GoogleDriveGeter(driveId);
                googleGeter.getLinkPlayWithCookiesAndExpireTime()
                    .then(function (_a) {
                    var linkPlays = _a[0], cookies = _a[1], expire = _a[2];
                    var googleLinks = { linkPlays: linkPlays};
                    var ourLinks = _this.getOurLinksFromGoogleLinks(googleLinks);
                    resolve(ourLinks);
                })["catch"](function (_a) {
                    var error = _a[0], cookies = _a[1];
                    reject(error);
                });
        });
    };
    return MyGatewayRequestManager;
}());
exports.MyGatewayRequestManager = MyGatewayRequestManager;
