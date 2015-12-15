/**
 * Created by Nguyen Duong Kim Hao on 14/12/2015.
 */

var dotenv = require('dotenv');
var colors = require('colors/safe');

exports = module.exports = {
	init: function () {
		"use strict";
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
			message: ['black', 'bold']
		});
		dotenv.load();

		Object.assign(module.exports, {
			debug: (process.env.DEBUG == "true"),
			express: {
				ip: "0.0.0.0",
				port: "80",
				static: {
					maxAge: '2 days'
				}
			}
		});
	}
}