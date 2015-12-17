/**
 * Created by Nguyen Duong Kim Hao on 14/12/2015.
 */

var config = require('./config');
var colors = require('colors/safe');
var _ = require('lodash');

var formatRegExp = /%[sdj]/g;
function format(f) {
	var util = require('util');

	if (typeof f !== 'string') {
		var objects = [];
		for (var i = 0; i < arguments.length; i++) {
			objects.push(util.inspect(arguments[i]));
		}
		return objects.join(' ');
	}


	var i = 1;
	var args = arguments;
	var str = String(f).replace(formatRegExp, function (x) {
		switch (x) {
			case '%s':
				return String(args[i++]);
			case '%d':
				return Number(args[i++]);
			case '%j':
				return JSON.stringify(args[i++]);
			default:
				return x;
		}
	});
	for (var len = args.length, x = args[i]; i < len; x = args[++i]) {
		if (x === null || typeof x !== 'object') {
			str += x;
		} else {
			str += util.inspect(x);
		}
	}
	return str;
}

exports = log = module.exports = function () {
	if (config.debug) {
		var res = process.stdout.write(format.apply(this, arguments) + '\n');
		if (!res && !process.stdout.pendingWrite) {
			process.stdout.pendingWrite = true;
			process.stdout.once('drain', function () {
				process.stdout.pendingWrite = false;
			});
		}
	}
};

var _log = exports._log = function (color, arguments) {
	if (config.debug) {
		var res = process.stdout.write(color(format.apply(this, arguments)) + '\n');
		if (!res && !process.stdout.pendingWrite) {
			process.stdout.pendingWrite = true;
			process.stdout.once('drain', function () {
				process.stdout.pendingWrite = false;
			});
		}
	}
};

exports.c = colors;

exports.d = exports.debug = function () {
	_log(colors.debug, arguments);
};

exports.i = exports.info = function () {
	_log(colors.info, arguments);
};

exports.m = exports.message = function () {
	_log(colors.message, arguments);
};

exports.t = exports.trace = function () {
	arguments = _.toArray(arguments);
	arguments.unshift('__');
	_log(colors.trace, arguments);
};

exports.e = exports.error = function () {
	_log(colors.error, arguments);
};

exports.ce = exports.criticalError = function () {
	_log(colors.criticalError, arguments);
	process.exit(1);
};