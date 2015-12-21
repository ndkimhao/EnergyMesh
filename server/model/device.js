/**
 * Created by Nguyen Duong Kim Hao on 20/12/2015.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var deviceSchema = exports.userSchema = new Schema({

	name: {
		type: String,
		required: true,
		unique: false
	},

	category: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: 'Category'
	}

});

deviceSchema.virtual('clientData')
	.get(function () {
		return {
			id: this._id,
			name: this.name,
			category: this.category.clientData
		}
	});

exports.init = function () {
	mongoose.model('Device', deviceSchema);
};