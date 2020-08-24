"use strict";
exports.__esModule = true;
var ClientRequestManager_1 = require("../models/ClientRequestManager");
var FastDownloaderUpgrade2_1 = require("../models/FastDownloaderUpgrade2");
var express = require('express');
var router 	= express.Router();
var request = require('request');
var r 		= request.defaults();
var config 	= require("../configs/servers");
var https 	= require('https');
var requestManager = new ClientRequestManager_1.ClientRequestManager();
/* GET home page. */
router.get('/', function (req, res, next) {
	var Domain 		= 	config.ALLOW_DOMAIN;
	var Referrer 	= 	req.headers.referrer || req.headers.referer;
	var PlayDomain 	= 	'';
	if (Referrer 	!= 	undefined) {
		var url		= 	require('url');
		var parse 	= 	url.parse(Referrer, true);
		PlayDomain 	= 	parse.host;
    }
	if (Domain.length > 0 && Domain.indexOf(PlayDomain) == -1) {
		res.writeHead(302, {
		  'Location': 'https://www.google.com/search?q='+config.Domain403
		});
		res.end();
	} else {
		var hash 		= req.query['hash'];
		var cookie 		= req.query['cookie'];
		var fileName 	= req.query['title'];
		var download 	= req.query['download'];
		if (hash == '' ) {
			var err = new Error('Please Insert Hash');
			err.status = 404;
			res.render('error', {
				message: err.message,
				error: {}
			});
		}
		if (cookie == '' ) {
			var err = new Error('Please Insert Cookie');
			err.status = 404;
			res.render('error', {
				message: err.message,
				error: {}
			});
		}
		requestManager.getHashData(hash, cookie)
			.then(function (data) {
			if (!data) {
				res.end();
				return;
			}
			var url 	= data.link;
			var cookies = data.cookies;
			var headers = {
				'range'			: req.headers.range,
				'cookie'		: 'DRIVE_STREAM='+data.cookies,
				'authority'		: 'drive.google.com',
				'method'		: 'GET',
				'scheme'		: 'https',
				'Last-Modified'	: new Date(),
				'user-agent'	: req.headers['user-agent']
			};
			var options = {
				uri: url,
				method: 'GET',
				headers: headers
			};
			
			res.setHeader('Content-type', 'application/octet-stream');
			res.setHeader('Content-Transfer-Encoding', 'Binary'); 
			//res.setHeader('Content-disposition', 'attachment; filename=video.'+data.cookies);
			
			var gRequest = request(url, options)
				.on('error', function (error) {
				console.log('o error ', error);
			});
			gRequest.pipe(res);
			req.on("close", function () {
				gRequest.abort();
			});
			req.on("end", function () {
				gRequest.abort();
			});
			return;
			new FastDownloaderUpgrade2_1.FastDownloaderUpgrade2().getStopUrlAndMetaInfo(url, headers.cookie, function (err, urlRedirect, options, length) {
					if (headers['range']) {
						options.headers['range'] = headers['range'];
					}
					var hds = {
						'Accept-Ranges'	: 'bytes',
						'Connection'	: 'keep-alive',
						'Last-Modified'	: headers['Last-Modified'],
						'user-agent'	: headers['user-agent'],
						'Content-Length': length,
						'Content-Range'	: ((headers['range'] ? headers['range'] : 'bytes=0-') + (length - 1) + '/' + length).replace('=', ' '),
						'Content-Type'	: 'video/mp4'
					};
					res.writeHead(206, hds);
					var start = 0;
					if (headers['range']) {
						var i1 = headers['range'].indexOf('bytes');
						var i2 = headers['range'].indexOf('-');
						start = parseInt((headers['range'].substring(i1 + 6, i2).trim()));
					}
					var domain = url.substring(url.indexOf('https://') + 'https://'.length, url.indexOf('/video.mp4'));
					options.headers['authority'] = domain;
					streamData(req, res, start, length, options, url);
				});
		})["catch"](function (error) {
			var err = new Error('404 Not Found');
			err.status = 404;
			res.render('error', {
				message: err.message,
				error: {}
			});
		});
	}
});
function streamData(req, res, start, length, options, url) {
    var isTop = false;
    req.connection.on('close', function () {
        isTop = true;
    });
    function doGetGoogleData() {
        var googleRequest;
        var countByteRecieve = 0;
        var lengthWant = 1024 * 1024 * 3;
		//var lengthWant = 512 * 1024;
        options.headers['range'] = 'bytes=' + start + '-';
        var isStopThisRequest = false;
        googleRequest = https.request(options, function (googleResponse) {
            var buffer = new Buffer(0);
            googleResponse.on('data', function (chunk) {
                if (buffer.length < lengthWant && !isStopThisRequest) {
                    buffer = Buffer.concat([buffer, chunk], buffer.length + chunk.length);
                    if (lengthWant <= buffer.length || start + buffer.length == length) {
                        isStopThisRequest = true;
                        googleRequest.abort();
                        start += buffer.length;
                        res.write(buffer, 'utf-8', function () {
                            buffer = new Buffer(0);
                            countByteRecieve = 0;
                        });
                    }
                }
                else {
                }
            });
            googleResponse.on('end', function (err, data) {
                if (start != length && !isTop) {
                    doGetGoogleData();
                }
                else if (start == length) {
                    res.end();
                }
                googleRequest = null;
            });
            googleResponse.on('error', function (e) {
            });
        });
        googleRequest.on('error', function (e) {
        });
        googleRequest.end();
    }
    doGetGoogleData();
}
module.exports = router;