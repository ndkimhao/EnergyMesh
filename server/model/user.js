/**
 * Created by Nguyen Duong Kim Hao on 15/12/2015.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({

	username: {
		type: String,
		required: true,
		unique: true,
		lowercase: true
	},

	password: {
		type: String,
		required: true
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

userSchema.virtual('clientData').get(function () {
	return {
		id: this._id,
		username: this.username,
		lastLogin: this.lastLogin
	}
});

exports.init = function () {
	mongoose.model('User', userSchema);
};