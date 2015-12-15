/**
 * Created by Nguyen Duong Kim Hao on 15/12/2015.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = exports.userSchema = new Schema({

	username: {
		type: String,
		required: "Username must be specified",
		unique: true,
		lowercase: true
	},

	password: {
		type: String,
		required: "Password must be specified"
	},

	created: {
		type: Date,
		default: Date.now
	},

	lastLogin: {
		type: Date,
		default: Date.now
	}

});

exports.init = function () {
	mongoose.model('User', userSchema);
}