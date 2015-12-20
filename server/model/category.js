/**
 * Created by Nguyen Duong Kim Hao on 19/12/2015.
 */

var config = require('../config');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var file = require('./file');
var uploadTo = '/public/userdata/category/';
var relPath = 'userdata/category/';

var categorySchema = new Schema({
	name: {
		type: String,
		required: 'Category name must be specified',
		unique: false
	},
	image: {
		type: String,
		required: false,
		default: 'img/other/no-image.png'
	}
});

categorySchema.virtual('imageFile')
	.set(file.set(uploadTo, relPath, 'image'));

categorySchema.virtual('clientData')
		.get(function () {
			return {
				id: this._id,
				name: this.name,
				image: this.image
			}
		});

exports.init = function () {
	mongoose.model('Category', categorySchema);
}