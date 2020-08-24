"use strict";
exports.__esModule = true;
var Promise = require('bluebird');
var parser = require('url-parse');
var request = require('request');
var request2 = require('request-promise').defaults({
    proxy:'http://180.188.196.22:1307',
    strictSSL :false
});
var fs = require("fs");
var gdrive_1 = require("./gdrive");
var {google} = require("googleapis");
var path_credentials = "/root/ProxyStream/token/credentials.json";

var nodeCache 		= require('node-cache');
var CACHE 			= new nodeCache(); 
var GoogleDriveGeter = (function () {
    function GoogleDriveGeter(fileId,token='') {
        this.headers = {
            'method': 'GET',
            'scheme': 'https',
            'user-agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.3.2743.138 Safari/537.36'
        };
		this.urlDownload = 'https://drive.google.com/file/d/' + fileId + '/view';
        this.fileId = fileId;
    }
    GoogleDriveGeter.prototype.doGet = function (url, callback) {
        var options = {
            uri: url,
            /* method: 'GET',
            headers: this.headers,
            followRedirect: true */
        };
        request2(url, function (err, res, body) {
            callback(err, res, body);
        });
    };
    GoogleDriveGeter.prototype.getLinkPlayWithCookiesAndExpireTime = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.doGet(_this.urlDownload, function (err, res, body) {
                if (!err) {
					var cookies = JSON.stringify(res.headers['set-cookie']);
					
					if (body.indexOf('fmt_stream_map') == -1) {
                        return reject([{ error: 'fmt_stream_map 1' }, cookies]);
                    }
					if (cookies.indexOf('DRIVE_STREAM') == -1) {
                        return reject([{ error: 'DRIVE_STREAM' }, cookies]);
                    }
					var cookiesx = cookies.split('DRIVE_STREAM=');
					var cookiesx = cookiesx[1].split(';');
					var cookiesxss = cookiesx[0];
                    var stream_map = body.split('fmt_stream_map","');
					if (stream_map[1] == undefined) {
                        return reject([{ error: 'fmt_stream_map 2' }, cookies]);
                    }
                        
                    var stream_map = stream_map[1].split('"]');
					var stringrep1 = stream_map[0].replace(/\\u003d/g, '=');
					var stringrep2 = stringrep1.replace(/\\u0026/g, '&');
					var stringrep3 = stringrep2.replace(/\\u0026/g, '&');
					var stringrep4 = stringrep3.replace(/\u0026/g, '&');
                    var array 	= stringrep4.split(',');
                    var result = [];
                    var maps = {};
					for (var i = 0; i < array.length; i++) {
                        var obj = array[i];
						const [itag, url] = obj.split('|');
						//console.log(url)
                        if (url.indexOf('itag=18') > 0 && !maps['360p']) {
                            maps['360p'] = url;
                        }
                        if (url.indexOf('itag=59') > 0 && !maps['480p']) {
                            maps['480p'] = url;
                        }
                        if (url.indexOf('itag=22') > 0 && !maps['720p']) {
                            maps['720p'] = url;
                        }
                        if (url.indexOf('itag=37') > 0 && !maps['1080p']) {
                            maps['1080p'] = url;
                        }
                    }
                    for (var quantity in maps) {
                        var link = maps[quantity].substring(-3);
                        result.push({ quantity: quantity, link: link, cookies: cookiesxss});
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
