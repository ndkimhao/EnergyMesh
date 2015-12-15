/**
 * Created by Nguyen Duong Kim Hao on 14/12/2015.
 */

var config = require('./config');
var log = require('./log');
var express = require('./express');

exports.start = function () {
	"use strict";
	config.init();
	express.init();
}