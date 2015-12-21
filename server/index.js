/**
 * Created by Nguyen Duong Kim Hao on 14/12/2015.
 */

var config = require('./config');
var log = require('./log');
var express = require('./express');
var db = require('./db');
var model = require('./model');
var passport = require('./passport');
var realtime = require('./controller/realtime');

exports.start = function () {
	config.init();
	log.message('[INIT] ', 'Starting server...');
	db.init();
	model.init();
	passport.init();
	express.init();
	realtime.initSocket();
}