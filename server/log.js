/**
 * Created by Nguyen Duong Kim Hao on 14/12/2015.
 */

var config = require('./config');
var colors = require('colors/safe');
var _ = require('lodash');

exports = log = module.exports = function (msg) {
	"use strict";
	if (config.debug) {
		console.log(msg);
	}
};

exports.c = colors;

exports.d = exports.debug = function () {
	"use strict";
	log(colors.debug(_.toArray(arguments).join('')));
};

exports.i = exports.info = function () {
	"use strict";
	log(colors.info(_.toArray(arguments).join('')));
};

exports.m = exports.message = function () {
	"use strict";
	log(colors.message(_.toArray(arguments).join('')));
};