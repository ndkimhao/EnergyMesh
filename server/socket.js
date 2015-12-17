/**
 * Created by Nguyen Duong Kim Hao on 16/12/2015.
 */

var express = require('./express');
var socketio = require('socket.io');
var log = require('./log');

exports.init = function () {
	var io = socketio.listen(express.server, {
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
}