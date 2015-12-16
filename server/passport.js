/**
 * Created by Nguyen Duong Kim Hao on 15/12/2015.
 */

var LocalStrategy = require('passport-local').Strategy;
var model = require('./model');
var passport = require('passport');
var log = require('./log');

exports.init = function () {
	var User = model.User;

	passport.serializeUser(function (user, done) {
		done(null, user.id);
	});
	passport.deserializeUser(function (id, done) {
		User.findById(id, function (err, user) {
			done(err, user);
		});
	});

	passport.use('local', new LocalStrategy(
			function (username, password, done) {
				username = username.toLowerCase();
				User.findOne({"username": username, "password": password}, function (err, user) {
					if (err) return done(err);
					if (!user) return done(null, false);
					user.lastLogin = Date.now();
					user.save();
					return done(null, user.clientData);
				});
			}
	));
}