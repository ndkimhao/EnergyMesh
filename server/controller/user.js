/**
 * Created by Nguyen Duong Kim Hao on 15/12/2015.
 */

var express = require('express');
var router = express.Router();
var passport = require('passport');

router.post('/login', passport.authenticate('local', {
	session: true
}), function (req, res) {
	return res.json(req.user.clientData);
});

router.get('/me', function (req, res, next) {
	return res.json(req.user.clientData);
});

module.exports = router;