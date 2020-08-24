"use strict";
exports.__esModule = true;
var MyGatewayRequestManager_1 = require("../models/MyGatewayRequestManager");
var express = require('express');
var router = express.Router();
var requestManager = new MyGatewayRequestManager_1.MyGatewayRequestManager();
var nodeCache 		= require('node-cache');
var CACHE 			= new nodeCache();
router.get('/', function (req, res, next) {
    var fileId 			= req.query['driveId'];
    var token 			= req.query['token'];
	var keycache 		= 'get-'+fileId;
	var loadCachePlay 	= CACHE.get(keycache);
	if(loadCachePlay){
		return res.json(JSON.parse(loadCachePlay));
	} else {
		requestManager.getOurLinks(fileId,token)
			.then(function (links) {
			var result = [];
			var domain = 'https://' + req.get('host');
			for (let i = 0; i < links.length; i++) {
				var label 	= links[i].label;
				var file 	= domain+links[i].file;
				result.push({ file, label, type: 'video/mp4' });
			}
			CACHE.set(keycache, JSON.stringify(result), 10800);
			res.json(result);
		})["catch"](function (error) {
			res.json(error);
		});
	}
});
module.exports = router;
