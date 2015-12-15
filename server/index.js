/**
 * Created by Nguyen Duong Kim Hao on 14/12/2015.
 */

var config = require('./config');
var log = require('./log');
var express = require('./express');
var db = require('./db');
var model = require('./model');

exports.start = function () {
	config.init();
	db.init();
	model.init();
	express.init();
}