/**
 * Created by Nguyen Duong Kim Hao on 18/12/2015.
 */

var express = require('express');
var router = express.Router();
var log = require('../log');

router.post('/push', function (req, res) {
	var data = req.body;
	log(data);
	return res.json({msg: "oks"});
});

module.exports = router;