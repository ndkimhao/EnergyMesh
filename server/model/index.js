/**
 * Created by Nguyen Duong Kim Hao on 15/12/2015.
 */

var mongoose = require('mongoose');

exports.init = function () {
	require('./user').init();
	Object.assign(module.exports, {
		User: mongoose.model('User')
	});
}