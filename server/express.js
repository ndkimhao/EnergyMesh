/**
 * Created by Nguyen Duong Kim Hao on 14/12/2015.
 */

var express = require('express');
var config = require('./config');
var log = require('./log');
var path = require('path');
var bodyParser = require('body-parser');
var session = require('express-session');
var mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');
var controller = require('./controller');
var serveStatic = require('./serve-static');

exports.init = function () {
	var app = express();
	if (config.debug) {
		app.use(require('morgan')('dev', {
			skip: function (req, res) {
				return req.originalUrl.indexOf('/api/') == -1 ||
						req.originalUrl == '/api/realtime/push';
			}
		}));
	}
	//app.use(bodyParser.urlencoded({extended: true}));
	app.use(bodyParser.json());

	app.use(session({
		secret: config.express.sessionSecret,
		store: new MongoStore({
			mongooseConnection: mongoose.connection,
			ttl: config.express.sessionTTL,
			collection: 'httpsessions'
		}),
		resave: false,
		saveUninitialized: false
	}));
	app.use(passport.initialize());
	app.use(passport.session());

	controller.init(app);
	app.use(serveStatic(path.join(process.cwd(), '/public'), config.express.static));
	/*app.get('/*', function (req, res) {
	 if (req.url.indexOf('/api/') == -1)
	 res.sendFile(path.join(process.cwd(), '/public/index.html'));
	 });*/

	exports.server = app.listen(config.express.port, config.express.ip, function () {
		log.message('[INIT-express] ', 'Server is listening on ', config.express.ip, ':', config.express.port);
	});
}