/**
 * Created by Nguyen Duong Kim Hao on 19/12/2015.
 */

var path = require('path');
var cwd = process.cwd();
var fs = require('fs');

module.exports.set = function (uploadTo, relPath, fieldName) {
	uploadTo = path.join(cwd, uploadTo);
	return function (params) {
		var fileObj = params[0];
		var filePart = fileObj.originalname.split('.');
		if (filePart.length > 0)
			var extension = '.' + filePart[filePart.length - 1];
		else var extension = '';
		var filename = this._id + extension;
		var _this = this;
		fs.readdir(uploadTo, function (err, files) {
			if (err) throw err;
			files.forEach(function (file) {
				if (filename != file && file.indexOf(_this._id) == 0) {
					var delPath = path.join(uploadTo, '/' + file);
					fs.unlink(delPath, function (err) {
						if (err) throw err;
					});
				}
			});
		});
		fs.rename(fileObj.path, path.join(uploadTo, filename), function (err) {
			if (err) {
				fs.unlink(u_path, function (err) {
					if (err) throw err;
				});
				throw err;
			}
			_this.set(fieldName, path.join(relPath, filename).replace(/\\/g, "/"));
			_this.save();
			params[1]();
		});
	};
};