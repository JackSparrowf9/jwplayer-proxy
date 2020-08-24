"use strict";
exports.__esModule = true;
var WebTool_1 = require("./WebTool");
var FastDownloaderUpgrade2 = (function () {
    function FastDownloaderUpgrade2() {
        this.https = require('https');
        this.WebTool = new WebTool_1.WebTool();
        this.request = require('request');
    }
    FastDownloaderUpgrade2.prototype.getStopUrlAndMetaInfo = function (url, cookie, callback) {
        var _this = this;
        var headers = {
            'cookie': cookie,
            'scheme': 'https',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36',
            'Connection': 'Keep-Alive'
        };
        this.getOptionsAndUrlRedirect(url, headers, function (err, urlRedirect, options) {
            if (!err) {
                if (!urlRedirect) {
                    urlRedirect = url;
                }
                _this.WebTool.getContentLengthResourceFromUrl(url, headers, function (err, length) {
                    if (err) {
                        callback({ ec: -1, ms: err.toString() });
                        return;
                    }
                    callback(err, urlRedirect, options, length);
                });
            }
            else {
                callback(err);
            }
        });
    };
    FastDownloaderUpgrade2.prototype.getOptionsAndUrlRedirect = function (url, headers, callback) {
        this.request(url, { method: 'HEAD', headers: headers }, function (err, res, body) {
            if (err) {
                callback(err);
                return;
            }
            if (res.statusCode == 200) {
                var urlRedirect = res.request.headers.referer;
                var options = res.request.uri;
                options.headers = headers;
                callback(null, urlRedirect, options);
            }
            else {
                callback(res.statusCode);
            }
        });
    };
    return FastDownloaderUpgrade2;
}());
exports.FastDownloaderUpgrade2 = FastDownloaderUpgrade2;