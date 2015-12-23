/**
 * Created by Nguyen Duong Kim Hao on 20/12/2015.
 */

app.controller('Dashboard.SessionCtrl', function ($scope, $http, $timeout, $deviceSvc, $em, cfpLoadingBar) {
	$('.footable').footable();
	$scope.$watchCollection('sessionData', function () {
		$timeout(function () {
			$('.footable').trigger('footable_redraw');
		});
	});
	$scope.moment = window.moment;

	$scope.defaultNewDev = {
		id: null,
		name: 'Chưa chọn',
		category: {
			name: 'Chưa chọn',
			image: 'img/other/none.png'
		}
	};

	var loadSessionData = function () {
		var tmpSessData;
		var oldData = $scope.sessionData;
		async.parallel([function (callback) {
			$deviceSvc.loadDeviceAndCategory(function (devData) {
				$scope.deviceData = devData;
				callback();
				cfpLoadingBar.inc();
			});
		}, function (callback) {
			$http.get('/api/session').success(function (data) {
				data.reverse();
				tmpSessData = data;
				callback();
				cfpLoadingBar.inc();
			});
		}], function () {
			$.each(tmpSessData, function (idx, sess) {
				if (sess.device) {
					sess.newDev = sess.device = $scope.deviceData.find(function (dev) {
						return dev.id == sess.device;
					});
				} else {
					sess.newDev = sess.device = $scope.defaultNewDev;
				}
				sess.start = moment(sess.start);
				sess.end = moment(sess.end);
			});
			$scope.sessionData = tmpSessData;
			if (oldData) {
				$.each(tmpSessData, function (idx, sess) {
					if (!oldData.find(function (elem) {
								return elem.id == sess.id;
							})
					) {
						sess.new = true;
					}
				});
			}
		});
	};
	loadSessionData();

	$scope.refresh = function () {
		cfpLoadingBar.start();
		loadSessionData();
		cfpLoadingBar.complete();
		$em.tInfo('Làm mới dữ liệu thành công !', 2);
	};

	function toTitleCase(str) {
		return str.replace(/\w\S*/g, function (txt) {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		});
	}

	$scope.makeTimeTooltip = function (mm) {
		return '<b>' + mm.calendar() + '</b><br>' + toTitleCase(mm.format('dddd, DD MMMM, YYYY'));
	};
	$scope.makeTimeFromNow = function (mm) {
		if (+mm < new Date().getTime()) {
			return mm.fromNow();
		} else {
			return 'hiện tại';
		}
	};

	$scope.devChange = function (sess, dev) {
		sess.newDev = dev;
	};


	$scope.clear = function (sess) {
		sess.newDev = sess.device;
	};

	$scope.update = function (sess) {
		$http
				.put('/api/session/{0}'.format(sess.id), {
					device: sess.newDev
				})
				.success(function (data) {
					$em.success('Cập nhật phiên đo thành công !', 2);
					sess.device = sess.newDev;
				});
	};

	$scope.delete = function (sess) {
		$em.confirm('Bạn có chắc chắn muốn xóa phiên đo ?', function () {
			$http
					.delete('/api/session/{0}'.format(sess.id))
					.success(function (data) {
						$em.success('Xóa phiên đo thành công !', 2);
						$scope.sessionData.splice($scope.sessionData.indexOf(sess), 1);
					});
		});
	};

});