/**
 * Created by Nguyen Duong Kim Hao on 20/12/2015.
 */

app.controller('Dashboard.SessionCtrl', function ($scope, $http, $timeout, $deviceSvc,
                                                  $em, cfpLoadingBar, $sessionSvc) {
	$('.footable').footable();
	$scope.$watchCollection('sessionData', function () {
		setTimeout(function () {
			$('.footable').trigger('footable_redraw');
		});
	});

	var colorMap = {
		'000': '#A1D490',
		'201': '#D4A190',
		'202': '#C390D4',
		'301': '#913D21',
		'302': '#752191'
	};

	$scope.defaultNewDev = $sessionSvc.defaultNewDev;
	var loadSessionData = function (forceLoad) {
		var tmpSessData;
		var oldData = $scope.sessionData;
		$sessionSvc[forceLoad ? 'load' : 'firstLoad'](function () {
			if (oldData) {
				$sessionSvc.data.forEach(function (sess) {
					if (!oldData.find(function (elem) {
								return elem.id == sess.id;
							})
					) {
						sess.new = true;
					}
				});
			}
			$sessionSvc.data.forEach(function (sess) {
				sess.color = colorMap[sess.sessionId.substring(0, 3)];
			});
			$scope.deviceData = $sessionSvc.deviceData;
			$scope.sessionData = $sessionSvc.data;
			//console.log($scope.sessionData);
		});
	};
	loadSessionData();

	$scope.refresh = function () {
		cfpLoadingBar.start();
		loadSessionData(true);
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

	function isBetween(a, b, c) {
		return b <= a && a <= c;
	}

	$scope.update = function (sess) {
		// TODO test duplicae detector
		var allow = true;
		if (sess.newDev.id) {
			// TODO bind to config.chunkTime
			var t_start = +sess.start;
			var t_end = +sess.end - (30 * 60 * 1000);
			var now = new Date().getTime();
			$scope.sessionData.some(function (sess_1) {
				if (sess_1.device.id != sess.newDev.id) return false;
				var t_start_1 = +sess_1.start;
				var t_end_1 = +sess_1.end - (30 * 60 * 1000);
				if (isBetween(t_start, t_start_1, t_end_1) || isBetween(t_end, t_start_1, t_end_1)) {
					allow = false;
					return true;
				}
				return false;
			});
		}
		if (allow) {
			$http
				.put('/api/session/{0}'.format(sess.id), {
					device: sess.newDev
				})
				.success(function (data) {
					$em.success('Cập nhật phiên đo thành công !', 2);
					sess.device = sess.newDev;
				});
		} else {
			$em.error('Phiên đo bị trùng lặp !<br>Tối đa một phiên đo một thiết bị cùng lúc.', 2);
		}
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