/**
 * Created by Nguyen Duong Kim Hao on 18/12/2015.
 */

var express = require('express');
var router = express.Router();
var log = require('../log');
var handle = require('../handle');
var socketio = require('socket.io');
var expressModule = require('../express');
var config = require('../config');
var model = require('../model');
var moment = require('moment');
var lodash = require('lodash');
var SessionMeta, Session;

var io;
var tmpData = {};

router.post('/push', function (req, res) {
	var data = req.body;
	var obj;
	if (!tmpData[data.id]) {
		obj = tmpData[data.id] = {};
		obj.id = data.id;
		obj.data = [];
		checkSessionMeta(obj.id);
	} else {
		obj = tmpData[data.id];
	}
	obj.data.push(data.power);
	//log(obj);
	caclPower();

	handle.success(res);
});
exports.router = router;

var lastSend = 0;
function caclPower() {
	var now = new Date().getTime();
	if (now - lastSend > config.realtime.minGap) {
		lastSend = new Date().getTime();
		var total = 0;
		lodash.each(tmpData, function (elem) {
			var data = elem.data;
			if (data && data.length > 0)
				total += data[data.length - 1];
		});
		//log(total);
		io.sockets.emit('reatime-data', {
			total: total
		});
	}
}

function checkSessionMeta(sId) {
	var sMeta;
	SessionMeta.findOne({
		sessionId: sId
	}, function (err, sess) {
		if (!err) {
			if (sess) {
				sMeta = sess;
			} else {
				sMeta = new SessionMeta({
					sessionId: sId
				});
			}
		}
		sMeta.end = moment().startOf('hour').add(1, 'hours');
		sMeta.save();
	});
}

function findSession(sId, callback) {
	Session.findOne({
		sessionId: sId,
		lastRecord: {
			"$gte": moment().add(-config.realtime.collectTime * 2).toDate(),
			"$lt": new Date()
		}
	}, function (err, sess) {
		if (!err) {
			var s;
			if (sess) {
				s = sess;
			} else {
				s = new Session({
					sessionId: sId,
					gap: config.realtime.collectTime
				});
			}
			s.lastRecord = new Date();
			callback(s);
			s.save();
		}
	});
}

function collectData() {
	lodash.each(tmpData, function (obj, id) {
		if (obj.data.length > 0) {
			var avPower = average(obj.data);
			obj.data = [];
			findSession(id, function (s) {
				s.data.push(avPower);
			});
		}
	});
}

function average(arr) {
	return lodash
					.reduce(arr, function (sum, num) {
						return sum + num;
					}, 0) / (arr.length === 0 ? 1 : arr.length);
}

exports.initSocket = function () {
	io = socketio.listen(expressModule.server, {
		path: '/api/realtime/socket'
	});
	io.on('connection', function (socket) {
		socket.emit('connection accepted');
		socket.on('connection established', function () {
			log.trace('Connection established, id = ', socket.id);
		});
		socket.on('disconnect', function () {
			log.trace('Connection disconnected, id = ', socket.id);
		});
	});

	SessionMeta = model.SessionMeta;
	Session = model.Session;
	setInterval(collectData, config.realtime.collectTime);
};