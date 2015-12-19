/**
 * Created by Nguyen Duong Kim Hao on 19/12/2015.
 */

var log = require('./log');

exports.general = function (err, res, obj) {
	if (err) {
		res.status(500).json({msg: 'Internal server error'});
		log.error(err);
		return false;
	}
	if (obj === null) {
		res.status(404).json({msg: 'Object not found'});
		return false;
	}
	return true;
};

exports.success = function (res) {
	res.json({msg: 'Success'});
};

exports.error = function (res) {
	res.status(400).json({msg: 'Error'});
};

exports.lastHandle = function (res) {
	return function (err) {
		if (err) {
			res.status(500).json({msg: 'Internal server error'});
			log.error(err);
			return false;
		}
		exports.success(res);
		return true;
	}
};