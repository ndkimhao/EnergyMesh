/**
 * Created by Nguyen Duong Kim Hao on 18/12/2015.
 */

var express = require('express');
var router = express.Router();
var log = require('../log');
var handle = require('../handle');
var socketio = require('socket.io');
var expressModule = require('../express');
var lodash = require('lodash');
var config = require('../config');
var io;

var tmpData = {};

router.post('/push', function (req, res) {
	var data = req.body;
	var obj;
	if (!tmpData[data.id]) {
		obj = tmpData[data.id] = {};
		obj.id = data.id;
		obj.data = [];
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
};