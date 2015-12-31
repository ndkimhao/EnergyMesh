/**
 * Created by Nguyen Duong Kim Hao on 20/12/2015.
 */

var request = require('request');
var storage = require('node-persist');
var util = require('util');
var lodash = require('lodash');

var sensor = se = [];

storage.initSync();
var log = console.log;
var curID = null;
var interval = 5000;
var randomDelay = 1000;

console.log('App started !');
process.stdin.on('data', function (data) {
	data = data.toString().replace('\r\n', '');
	try {
		console.log(' >> ' + util.inspect(eval(data)));
	} catch (e) {
		console.log(' >> ' + util.inspect(e));
	}
});

var off = function (no) {
	sensor[no].on = false;
	save();
	return sensor[no];
};
var on = function (no) {
	sensor[no].on = true;
	save();
	return sensor[no];
};
var change = c = function (no, id, power, range) {
	sensor[no].on = true;
	if (id === 1) {
		sensor[no].id = ("0000000" + (parseInt(sensor[no].id, 16) + 1).toString(16)).substr(-8);
	} else if (id) {
		sensor[no].id = ("0000000" + id).substr(-8);
	}
	if (power) {
		sensor[no].power = power;
	}
	if (range) {
		sensor[no].range = range;
	}
	save();
	return sensor[no];
};

var addSensor = a = function (id, power, range) {
	var r;
	sensor.push(r = {
		no: sensor.length,
		id: ("0000000" + id).substr(-8),
		power: power,
		range: range,
		on: true
	});
	save();
	return r;
};

Math.nrand = function () {
	var x1, x2, rad, y1;
	do {
		x1 = 2 * this.random() - 1;
		x2 = 2 * this.random() - 1;
		rad = x1 * x1 + x2 * x2;
	} while (rad >= 1 || rad == 0);
	var c = this.sqrt(-2 * Math.log(rad) / rad);
	return x1 * c;
};

function random(absMax) {
	return Math.floor(Math.random() * absMax) * (Math.random() > 0.5 ? -1 : 1);
}

var changeTime = ct = start = function (randomD, newTime) {
	if (randomD) randomDelay = randomD;
	if (newTime) interval = newTime;

	if (curID) {
		clearInterval(curID);
	}
	var t = interval / 2;
	curID = setInterval(function () {
		lodash.each(sensor, function (elem) {
			var delay = random(randomDelay);
			setTimeout(function () {
				if (elem.on) {
					var power = elem.power + random(elem.range);
				} else {
					var power = Math.random() * 0.2;
				}
				power += Math.random();
				//console.log(elem, power);
				try {
					request('http://localhost/api/realtime/push', {
						timeout: 200,
						method: "POST",
						json: {
							id: elem.id,
							power: power,
							devStatus: [{ctrlCode: '0100', isOn: true}]
						}
					}, function (err, data, body) {
						if (body && body.length > 0) {
							console.log(body);
						}
					});
				} catch (e) {
					console.err(e);
				}
			}, t + delay);
			//console.log(t + delay);
		});
	}, t);

	save();
	return 'Started';
};

var stop = s = function () {
	if (curID) {
		clearInterval(curID);
		curID = null;
	}

	save();
	return 'Stopped';
};

var save = function () {
	storage.setItem('sensor', sensor);
	storage.setItem('interval', interval);
	storage.setItem('randomDelay', randomDelay);
};

var clear = function () {
	storage.clearItem('sensor');
	storage.clearItem('interval');
	storage.clearItem('randomDelay');
};

sensor = storage.getItemSync('sensor');
se = sensor = (sensor == 0 ? [] : sensor);
interval = storage.getItemSync('interval') | 5000;
randomDelay = storage.getItemSync('randomDelay') | 1000;