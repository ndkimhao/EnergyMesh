/**
 * Created by Nguyen Duong Kim Hao on 14/12/2015.
 */

var dotenv = require('dotenv');
var colors = require('colors/safe');
var ms = require('ms');

function getConfig() {
	return {
		debug: (process.env.DEBUG == "true"),
		express: {
			ip: "0.0.0.0",
			port: "80",
			static: {
				maxAge: '0 days'
			},
			sessionSecret: process.env.TOKEN_SECRET,
			sesstionTTL: 14 * 24 * 60 * 60 // = 14 days. Default
		},
		db: {
			url: process.env.MONGODB_URL
		},
		mongoose: {
			server: {
				poolSize: 5
			}
		},
		realtime: {
			minGap: ms('1 seconds'),
			collectTime: ms('10 seconds'),
			chunkTime: ms('30 minutes')
		}
	};
}

exports.init = function () {
	colors.setTheme({
		silly: 'rainbow',
		input: 'grey',
		verbose: 'cyan',
		prompt: 'grey',
		info: ['green', 'bold'],
		data: 'black',
		help: 'cyan',
		warn: 'yellow',
		debug: ['blue', 'bold'],
		error: 'red',
		message: ['black', 'bold'],
		trace: 'black',
		criticalError: ['red', 'bold', 'underline']
	});
	dotenv.load();

	Object.assign(module.exports, getConfig());
};