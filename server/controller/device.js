/**
 * Created by Nguyen Duong Kim Hao on 20/12/2015.
 */

var express = require('express');
var router = express.Router();
var handle = require('../handle');
var log = require('../log');

var model = require('../model');
var Device = model.Device;

router
	.route('/')
	.get(function (req, res) {
		Device
			.find()
			.populate('category', 'name image')
			.exec(function (err, arr) {
				if (handle.general(err, res, arr)) {
					res.json(arr.map(function (dev) {
						return dev.clientData;
					}));
				}
			});
	})
	.post(function (req, res) {
		if (req.body.name && req.body.category.id) {
			var dev = new Device({
				name: req.body.name,
				category: req.body.category.id
			});
			dev.save(handle.lastHandle(res));
		} else {
			handle.error(res);
		}
	});

router
		.route('/control')
		.get(function (req, res) {
			Device
					.find({
						ctrlCode: {$ne: ''}
					})
					.populate('category', 'name image')
					.exec(function (err, arr) {
						if (handle.general(err, res, arr)) {
							res.json(arr.map(function (dev) {
								return dev.clientData;
							}));
						}
					});
		});

router
		.route('/control/:id')
		.post(function (req, res) {
			if (req.body.isOn !== undefined) {
				Device.findById(req.params.id, function (err, dev) {
					if (handle.general(err, res, dev)) {
						dev.isOn = req.body.isOn;
						dev.save(handle.lastHandle(res));
					}
				});
			} else {
				handle.error(res);
			}
		});

router
	.route('/:id')
	.put(function (req, res) {
		if (req.body.name && req.body.category.id && req.body.ctrlCode !== undefined) {
			Device.findById(req.params.id, function (err, dev) {
				if (handle.general(err, res, dev)) {
					dev.name = req.body.name;
					dev.category = req.body.category.id;
					dev.ctrlCode = req.body.ctrlCode;
					dev.save(handle.lastHandle(res));
				}
			});
		} else {
			handle.error(res);
		}
	})
	// TODO: Delete all assoiated data
	.delete(function (req, res) {
		Device.findById(req.params.id, function (err, dev) {
			if (handle.general(err, res, dev)) {
				dev.remove(handle.lastHandle(res));
			}
		});
	});

module.exports = router;