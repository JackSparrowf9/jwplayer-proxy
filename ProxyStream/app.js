"use strict";
exports.__esModule = true;
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var videoplayback = require('./routes/videoplayback');
var link = require('./routes/link');
var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));
app.use('/video.mp4', videoplayback);
app.use('/link', link);
app.use(function (req, res, next) {
    var err = new Error('404 Not Found');
    err.status = 404;
    res.render('error', {
        message: err.message,
        error: {}
    });
});
app.disable('x-powered-by');
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
module.exports = app;
