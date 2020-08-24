"use strict";
exports.__esModule = true;
var express = require('express');
var router 	= express.Router();
var config 	= require("../configs/servers");
var https 	= require('https');
var nodeCache = require('node-cache');
var CACHE = new nodeCache();
/* GET home page. */
router.get('/', function (req, res, next) {
	var NodeDefault 	= config.NumberNode;
	var Prefix 			= config.Prefix;
	var DomainNode 		= config.DomainNode;
	var keycache 		= config.KeyCacheNode;
	var loadNode 		= CACHE.get(keycache);
    if(loadNode){
		var nodeActive = loadNode + 1;
		if(nodeActive > NodeDefault){
			var nodeActive = 1;
			CACHE.set(keycache, nodeActive, 60 * 60 * 3);
		} else {
			CACHE.set(keycache, nodeActive, 60 * 60 * 3);
		}
		
	} else {
		var nodeActive = 1;
		CACHE.set(keycache, nodeActive, 60 * 60 * 3);
	}
	var hash 		= req.query['hash'];
	var cookie 		= req.query['cookie'];
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
	var randomDomain = DomainNode[Math.floor(Math.random() * DomainNode.length)];
	var DomainActive = 'https://' + Prefix + nodeActive + '.' +randomDomain;
	res.writeHead(302, {
	  'Location': DomainActive +'/video.mp4?hash='+hash+'&cookie='+ cookie
	});
	res.end();
});
module.exports = router;