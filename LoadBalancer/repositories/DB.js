"use strict";
exports.__esModule = true;
var redis = require("redis");
var MAP_URL_TO_HTML_DATA = 'KEY-';
var client = redis.createClient();
var DB = (function () {
    function DB() {
    }
    DB.getRequestData = function (url) {
        client.get(MAP_URL_TO_HTML_DATA + url);
    };
    DB.setRequestData = function (url, data, expire) {
        client.set(MAP_URL_TO_HTML_DATA + url, data, 'EX', expire);
    };
    return DB;
}());
exports.DB = DB;
