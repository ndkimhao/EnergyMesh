/**
 * Created by Nguyen Duong Kim Hao on 14/12/2015.
 */

var config = require('./config');
var colors = require('colors/safe');
var _ = require('lodash');

exports = log = module.exports = function () {
	if (config.debug) {
		console.log(_.toArray(arguments).join(''));
	}
};

exports.c = colors;

exports.d = exports.debug = function () {
	log(colors.debug(_.toArray(arguments).join('')));
};

exports.i = exports.info = function () {
	log(colors.info(_.toArray(arguments).join('')));
};

exports.m = exports.message = function () {
	log(colors.message(_.toArray(arguments).join('')));
};

exports.e = exports.error = function () {
	log(colors.error(_.toArray(arguments).join('')));
};

exports.ce = exports.criticalError = function () {
	log(colors.criticalError(_.toArray(arguments).join('')));
	process.exit(1);
};