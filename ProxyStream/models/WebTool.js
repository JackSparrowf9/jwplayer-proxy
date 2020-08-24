"use strict";
exports.__esModule = true;

var WebTool = (function () {
    function WebTool() {
        this.request = require('request');
        this.sync_request = require('sync-request');
        this.fs = require('fs');
    }
    WebTool.prototype.getHtml = function (url, callback) {
        this.request({
            url: url,
            encoding: null
        }, function (error, response, body) {
            if (!error) {
                body = body.toString();
            }
            callback(error, body);
        });
    };
    WebTool.prototype.getHtml = function (url, callback) {
        this.request({
            url: url,
            encoding: null,
            family: 6
        }, function (error, response, body) {
            if (!error) {
                body = body.toString();
            }
            callback(error, body);
        });
    };
    WebTool.prototype.getSyncHtml = function (url, options) {
        var res = this.sync_request('GET', url, options);
        return res.body.toString('utf-8');
    };
    WebTool.prototype.checkPicasaLinkLive = function (url, callback) {
        this.request({ url: url, followRedirect: false }, function (error, response, body) {
            callback(error, response.headers);
        });
    };
    WebTool.prototype.getUrlHeader = function (url, headers, callback) {
        if (!url) {
            callback({ ms: 'Url must be string' });
            return;
        }
        this.request(url, { method: 'HEAD', headers: headers }, function (err, res, body) {
            if (res) {
                callback(err, res.headers);
            }
            else {
                callback(err);
            }
        });
    };
    WebTool.prototype.getUrlHeaderOptions = function (url, headers, callback) {
        if (!url) {
            callback({ ms: 'Url must be string' });
            return;
        }
        this.request({ url: url, headers: headers, method: 'HEAD' }, function (err, res, body) {
            if (res) {
                callback(err, res);
            }
            else {
                callback(err);
            }
        });
    };
    WebTool.prototype.getContentLengthResourceFromUrl = function (url, headers, callback) {
        this.getUrlHeader(url, headers, function (err, res) {
            if (!err) {
                callback(err, res['content-length']);
            }
            else {
                callback(err);
            }
        });
    };
    return WebTool;
}());
exports.WebTool = WebTool;
