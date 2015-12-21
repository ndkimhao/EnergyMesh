/**
 * Created by Nguyen Duong Kim Hao on 15/12/2015.
 */

var checkUser = function (req, res, next) {
	// TODO: Enable auth
	//if (!req.user && req.path != '/user/login') {
	//	return res.status(401).send('Unauthorized');
	//}
	next();
};

var notFound = function (req, res, next) {
	return res.status(404).send('API not found');
}

exports.init = function (app) {
	app.use('/api/', checkUser);
	app.use('/api/user/', require('./user'));
	app.use('/api/realtime/', require('./realtime').router);
	app.use('/api/category/', require('./category'));
	app.use('/api/device/', require('./device'));
	app.use('/api/session/', require('./session'));
	app.use('/api/', notFound);
}