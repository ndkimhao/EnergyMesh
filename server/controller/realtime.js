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
var SessionMeta, Session, Device;

var io;
var tmpData = {};
var requestingDataClient = [];

var deviceStatus = [];

exports.addDeviceStatus = function (ctrlCode, isOn) {
	lodash.remove(deviceStatus, function (elem) {
		return elem.ctrlCode == ctrlCode;
	});
	deviceStatus.push({
		ctrlCode: ctrlCode,
		isOn: isOn,
		ttl: config.realtime.deviceStatusTTL
	});
};

router.post('/push', function (req, res) {
	if (req.body.devStatus) {
		req.body.devStatus.forEach(function (elem) {
			Device.update({
				ctrlCode: elem.ctrlCode
			}, {
				$set: {isOn: elem.isOn}
			}, {
				multi: true
			}, function () {
			});
			lodash.remove(deviceStatus, function (elem1) {
				return elem.ctrlCode == elem1.ctrlCode;
			});
		});

	}

	res.json(deviceStatus);
	lodash.remove(deviceStatus, function (elem) {
		elem.ttl--;
		return elem.ttl <= 0;
	});

	if (req.body.sensor) {
		req.body.sensor.forEach(function (data) {
			var obj;
			if (!tmpData[data.id]) {
				obj = tmpData[data.id] = {
					id: data.id,
					data: [],
					tmpData: null
				};
				checkSessionMeta(obj.id);
			} else {
				obj = tmpData[data.id];
			}
			obj.data.push(Math.abs(data.p));
			sendDataToSocket();
		});
	}
});
exports.router = router;

var lastSend = 0;
function sendDataToSocket() {
	var now = new Date().getTime();
	if (now - lastSend > config.realtime.minGap) {
		lastSend = new Date().getTime();
		var total = 0;
		var detailData = {};
		lodash.each(tmpData, function (elem, sessId) {
			var data = elem.data;
			if (data && (data.length > 0 || elem.tmpData)) {
				var val = data[data.length - 1] || elem.tmpData;
				total += val;
				detailData[sessId] = val;
			}
		});
		//log(total);
		lodash.each(requestingDataClient, function (socket) {
			if (socket.sendRealtimeData) {
				socket.emit('reatime data', {
					total: total,
					detail: detailData
				});
			}
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
		sMeta.end = moment().add(config.realtime.chunkTime, 'ms');
		sMeta.save();
	});
}

// TODO: use native update method
function findSession(sId, callback) {
	Session.findOne({
		sessionId: sId,
		lastRecord: {
			'$gte': moment().add(-config.realtime.collectTime * 2, 'ms').toDate()
		},
		start: {
			'$gte': moment().add(-config.realtime.chunkTime, 'ms').toDate()
		}
	}, function (err, sess) {
		if (!err) {
			var s;
			if (sess) {
				s = sess;
			} else {
				// TODO: set device property if exist
				var gap = config.realtime.collectTime;
				var start = Math.round(Date.now() / gap) * gap;
				s = new Session({
					sessionId: sId,
					gap: gap,
					start: start
				});
				checkSessionMeta(sId);
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
			obj.tmpData = avPower;
			findSession(id, function (s) {
				s.data.push(avPower);
			});
		} else {
			obj.tmpData = null;
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
			lodash.remove(requestingDataClient, socket);
		});
		socket.on('start data', function () {
			socket.sendRealtimeData = true;
			requestingDataClient.push(socket);
		});
		socket.on('stop data', function () {
			socket.sendRealtimeData = false;
			lodash.remove(requestingDataClient, socket);
		});
	});

	SessionMeta = model.SessionMeta;
	Session = model.Session;
	Device = model.Device;
	setInterval(collectData, config.realtime.collectTime);
};