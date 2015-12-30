/**
 * Created by Nguyen Duong Kim Hao on 27/12/2015.
 */

var express = require('express');
var router = express.Router();
var handle = require('../handle');
var log = require('../log');

var model = require('../model');
var Session = model.Session;
var SessionMeta = model.SessionMeta;

router.post('/all', function (req, res) {
	if (req.body.start && req.body.end) {
		Session.find({
			start: {
				'$gte': new Date(req.body.start),
				'$lte': new Date(req.body.end)
			}
		}, function (err, arr) {
			if (handle.general(err, res, arr)) {
				res.json(arr);
			}
		});
	} else {
		handle.error(res);
	}
});

module.exports = router;