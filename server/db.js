/**
 * Created by Nguyen Duong Kim Hao on 15/12/2015.
 */

var config = require('./config');
var mongoose = require('mongoose');
var log = require('./log');

exports.init = function () {
	'use strict';

	mongoose.connect(config.db.url, config.mongoose);
	mongoose.connection.once('open', function () {
		log.message('[INIT-db] ', 'MongoDB connected successfully');
	});
	mongoose.connection.on('error', function (err) {
		log.criticalError('[INIT-db] ', 'MongoDB connect error: ', err);
	});
}