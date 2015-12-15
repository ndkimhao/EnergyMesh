/**
 * Created by Nguyen Duong Kim Hao on 14/12/2015.
 */

var express = require('express');
var config = require('./config');
var log = require('./log');
var path = require('path');

exports.init = function () {
	"use strict";
	log.message('Starting server...');

	var app = express();

	app.use(express.static(path.join(process.cwd(), '/public'), config.express.static));

	app.listen(config.express.port, config.express.ip, function () {
		log.message('Server is listening on ', config.express.ip, ':', config.express.port);
	});
}