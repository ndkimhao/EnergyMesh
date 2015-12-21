/**
 * Created by Nguyen Duong Kim Hao on 15/12/2015.
 */

var mongoose = require('mongoose');

exports.init = function () {
	require('./user').init();
	require('./category').init();
	require('./device').init();
	require('./sessionMeta').init();

	Object.assign(module.exports, {
		User: mongoose.model('User'),
		Category: mongoose.model('Category'),
		Device: mongoose.model('Device'),
		SessionMeta: mongoose.model('SessionMeta'),
	});
};