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
				_this.data = data.map(function (cat) {
					return {
						id: cat.id,
						name: cat.name,
						newName: cat.name,
						image: cat.image
					}
				});
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