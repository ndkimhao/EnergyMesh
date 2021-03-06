/**
 * Created by Nguyen Duong Kim Hao on 20/12/2015.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sessionSchema = new Schema({

	sessionId: {
		type: String,
		required: true,
		unique: false
	},

	start: {
		type: Date,
		required: true,
		default: function () {
			return new Date();
		}
	},

	lastRecord: {
		type: Date,
		required: true,
		default: function () {
			return new Date();
		}
	},

	data: [Number],

	gap: {
		type: Number,
		required: true
	},

	device: {
		type: Schema.Types.ObjectId,
		default: null
	}

});

exports.init = function () {
	mongoose.model('Session', sessionSchema);
};