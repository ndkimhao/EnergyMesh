/**
 * Created by Nguyen Duong Kim Hao on 19/12/2015.
 */

var log = require('../log');
var path = require('path');
var express = require('express');
var router = express.Router();
var passport = require('passport');
var model = require('../model');
var Category = model.Category;
var handle = require('../handle');

var multer = require('multer');
var upload = multer({dest: path.join(process.cwd(), '/public/userdata/temp')});

router.put('/:id/image', upload.single('image'), function (req, res) {
	Category.findById(req.params.id, function (err, cat) {
		if (handle.general(err, res, cat)) {
			if (req.file) {
				cat.imageFile = req.file;
				handle.success(res);
			} else {
				handle.error(res);
			}
		}
	});
});

router
	.route('/:id')
	.delete(function (req, res) {
		Category.findById(req.params.id, function (err, cat) {
			if (handle.general(err, res, cat)) {
				cat.remove(handle.lastHandle(res));
			}
		});
	})
	.put(function (req, res) {
		Category.findById(req.params.id, function (err, cat) {
			if (handle.general(err, res, cat)) {
				if (req.body.name) {
					cat.name = req.body.name;
					cat.save(handle.lastHandle(res));
				}
			}
		});
	});

router
	.route('/')
	.post(function (req, res) {
		if (req.body.name) {
			var cat = new Category({
				name: req.body.name
			});
			cat.save(handle.lastHandle(res));
		}
	})
	.get(function (req, res) {
		Category.find(function (err, arr) {
			if (handle.general(err, res, arr)) {
				res.json(arr);
			}
		});
	});

module.exports = router;