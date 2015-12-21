/**
 * Created by Nguyen Duong Kim Hao on 20/12/2015.
 */

var express = require('express');
var router = express.Router();
var handle = require('../handle');
var log = require('../log');

var model = require('../model');
var Session = model.Session;
var SessionMeta = model.SessionMeta;

router
		.route('/')
		.get(function (req, res) {
			SessionMeta.find(function (err, arr) {
				if (handle.general(err, res, arr)) {
					res.json(arr.map(function (sess) {
						return sess.clientData;
					}));
				}
			});
		})
//.post(function (req, res) {
//	if (req.body.name) {
//		var dev = new Device({
//			name: req.body.name,
//			category: req.body.category.id
//		});
//		dev.save(handle.lastHandle(res));
//	}
//});

module.exports = router;