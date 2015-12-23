/**
 * Created by Nguyen Duong Kim Hao on 19/12/2015.
 */

app.factory('$em', function (toaster) {
	var sa = function (type, title) {
		return function (text, time) {
			sweetAlert({
				title: title,
				text: text +
				(time ? ('<br><span class="update-sucess-msg">Thông báo tự đóng sau '
				+ time + ' giây<span>') : ''),
				type: type,
				timer: time ? time * 1000 : null,
				html: true,
				allowOutsideClick: true
			});
		};
	};

	var t = function (type, title) {
		return function (text, time) {
			toaster.pop({
				type: type,
				title: title,
				body: text,
				showCloseButton: true,
				timeout: time ? time * 1000 : null
			});
		};
	}

	return {
		success: sa('success', 'Thành công'),
		error: sa('error', 'Lỗi'),
		info: sa('info', 'Thông báo'),

		tSuccess: t('success', 'Thành công'),
		tError: t('error', 'Lỗi'),
		tInfo: t('info', 'Thông báo'),

		confirm: function (text, func) {
			swal({
				title: 'Xác nhận',
				text: text,
				allowOutsideClick: true,
				type: 'warning',
				showCancelButton: true,
				confirmButtonColor: '#DD6B55',
				cancelButtonText: 'Hủy bỏ',
				confirmButtonText: 'ĐỒNG Ý',
				closeOnConfirm: false,
				showLoaderOnConfirm: true
			}, function () {
				if (func) func();
			});
		}
	}
});

app.factory('$categorySvc', function ($http) {
	return {
		load: function (callback) {
			var _this = this;
			$http.get('/api/category').success(function (data) {
				$.each(data, function (index, cat) {
					cat.newName = cat.name;
				});
				_this.data = data;
				if (callback) callback();
			});
		},
		firstLoad: function (callback) {
			if (!this.data) {
				this.load(callback);
			} else {
				callback();
			}
		},
		data: null
	}
});

app.factory('$deviceSvc', function ($http, $categorySvc) {
	return {
		load: function (callback) {
			var _this = this;
			$http.get('/api/device').success(function (data) {
				$.each(data, function (idx, dev) {
					dev.$new = $.extend({}, dev);
				});
				_this.data = data;
				if (callback) callback();
			});
		},
		firstLoad: function (callback) {
			if (!this.data) {
				this.load(callback);
			} else {
				callback();
			}
		},
		data: null,
		loadDeviceAndCategory: function (callback) {
			var catData, devData;
			var $deviceSvc = this;
			async.parallel([
				function (callback) {
					$categorySvc.firstLoad(function () {
						catData = $categorySvc.data;
						callback();
					});
				},
				function (callback) {
					$deviceSvc.firstLoad(function () {
						devData = $deviceSvc.data;
						callback();
					});
				}
			], function () {
				$.each(devData, function (idx, dev) {
					dev.category = dev.$new.category = catData.find(function (cat) {
						return cat.id == dev.category.id;
					});
				});
				callback(devData, catData);
			});
		}
	}
});

app.factory('$sessionSvc', function ($http, $deviceSvc, cfpLoadingBar) {
	return {
		load: function (callback) {
			var _this = this;
			async.parallel([function (callback) {
				$deviceSvc.loadDeviceAndCategory(function (devData) {
					_this.deviceData = devData;
					cfpLoadingBar.inc();
					callback();
				});
			}, function (callback) {
				$http.get('/api/session').success(function (data) {
					data.reverse();
					_this.data = data;
					cfpLoadingBar.inc();
					callback();
				});
			}], function () {
				$.each(_this.data, function (idx, sess) {
					if (sess.device) {
						sess.newDev = sess.device = _this.deviceData.find(function (dev) {
							return dev.id == sess.device;
						});
					} else {
						sess.newDev = sess.device = _this.defaultNewDev;
					}
					sess.start = moment(sess.start);
					sess.end = moment(sess.end);
				});
				callback();
			});
		},
		firstLoad: function (callback) {
			if (!this.data) {
				this.load(callback);
			} else {
				callback();
			}
		},
		data: null,
		deviceData: null,
		defaultNewDev: {
			id: null,
			name: 'Chưa chọn',
			category: {
				name: 'Chưa chọn',
				image: 'img/other/none.png'
			}
		}
	}
});

app.factory('$socket', function () {
	return {
		load: function (callback) {
			var _this = this;
			var socket = io({
				path: '/api/realtime/socket'
			});
			socket.on('connection accepted', function (data) {
				socket.emit('connection established');
				_this.io = socket;
				if (callback) callback();
			});
		},
		firstLoad: function (callback) {
			if (!this.io) {
				this.load(callback);
			} else {
				if (callback) callback();
			}
		},
		io: null
	}

});