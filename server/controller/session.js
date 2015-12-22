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
		});

router
		.route('/:id')
		.put(function (req, res) {
			if (req.body.device) {
				SessionMeta.findById(req.params.id, function (err, sess) {
					if (handle.general(err, res, sess)) {
						var devId = req.body.device.id;
						sess.device = devId;
						sess.save();
						Session.update({
							sessionId: sess.sessionId
						}, {
							$set: {device: devId}
						}, {
							multi: true
						}, handle.lastHandle(res));
				}
			});
			}
		})
		.delete(function (req, res) {
			SessionMeta.findById(req.params.id, function (err, sess) {
				if (handle.general(err, res, sess)) {
					Session.remove({
						sessionId: sess.sessionId
					}, handle.lastHandle(res));
					sess.remove();
				}
			});
		});

module.exports = router;