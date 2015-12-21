/**
 * Created by Nguyen Duong Kim Hao on 21/12/2015.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sessionMetaSchema = new Schema({

	sessionId: {
		type: String,
		required: true,
		unique: true
	},

	start: {
		type: Date,
		required: true,
		default: function () {
			return new Date();
		}
	},

	end: {
		type: Date,
		required: true
	},

	device: {
		type: Schema.Types.ObjectId,
		default: null
	}

});

exports.init = function () {
	mongoose.model('SessionMeta', sessionMetaSchema);
};