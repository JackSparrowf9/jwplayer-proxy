"use strict";
exports.__esModule = true;
var Promise = require('bluebird');
var parser = require('url-parse');

var request = require('request');
var GoogleDriveGeter = (function () {
    function GoogleDriveGeter(fileId) {
        this.headers = {
            'method': 'GET',
            'scheme': 'https',
            'user-agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.3.2743.138 Safari/537.36'
        };
        this.urlDownload = 'https://drive.google.com/e/get_video_info?docid=' + fileId;
        this.fileId = fileId;
    }
    GoogleDriveGeter.prototype.doGet = function (url, callback) {
        var options = {
            uri: url,
            method: 'GET',
            headers: this.headers,
            followRedirect: true
        };
        request(options, function (err, res, body) {
            callback(err, res, body);
        });
    };
    GoogleDriveGeter.prototype.getLinkPlayWithCookiesAndExpireTime = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.doGet(_this.urlDownload, function (err, res, body) {
                if (!err) {
                    var cookies = JSON.stringify(res.headers['set-cookie']);
                    var cookiesx = cookies.split('DRIVE_STREAM=');
                    var cookiesx = cookiesx[1].split(';');
					
                    body = decodeURIComponent(decodeURIComponent(decodeURIComponent(body)));
                    if (body.indexOf('status=fail') == 0) {
                        return reject([{ error: body }, cookies]);
                    }
                    if (body.indexOf('errorcode=') == 0) {
                        return reject([{ error: body }, cookies]);
                    }
                    var stream_map = body.split('fmt_stream_map=');
                    var stream_map = stream_map[1].split('l_encoded_');
                    var array 	= stream_map[0].split('|');
                    var result = [];
                    var maps = {};
					for (var i = 0; i < array.length; i++) {
                        var obj = array[i];
                        var length = obj.length;
                        if (obj.indexOf('itag=18') > 0 && !maps['360p']) {
                            maps['360p'] = obj.substring(0, length - 3);
                        }
                        if (obj.indexOf('itag=59') > 0 && !maps['480p']) {
                            maps['480p'] = obj.substring(0, length - 3);
                        }
                        if (obj.indexOf('itag=22') > 0 && !maps['720p']) {
                            maps['720p'] = obj.substring(0, length - 3);
                        }
                        if (obj.indexOf('itag=37') > 0 && !maps['1080p']) {
                            maps['1080p'] = obj.substring(0, length - 3);
                        }
                    }
                    for (var quantity in maps) {
                        var link = maps[quantity].substring(-3);
                        result.push({ quantity: quantity, link: link, cookies: cookiesx[0]});
                    }
                    resolve([result]);
                }
                else {
                    reject([err, cookies]);
                }
            });
        });
    };
    return GoogleDriveGeter;
}());
exports.GoogleDriveGeter = GoogleDriveGeter;
