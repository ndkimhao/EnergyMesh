/**
 * Created by Nguyen Duong Kim Hao on 20/12/2015.
 */

app.controller('Dashboard.SessionCtrl', function ($scope, $http, $timeout, $deviceSvc,
                                                  $em, cfpLoadingBar, $sessionSvc) {
	$('.footable').footable();
	$scope.$watchCollection('sessionData', function () {
		$timeout(function () {
			$('.footable').trigger('footable_redraw');
		});
	});

	$scope.defaultNewDev = $sessionSvc.defaultNewDev;
	var loadSessionData = function () {
		var tmpSessData;
		var oldData = $scope.sessionData;
		$sessionSvc.firstLoad(function () {
			if (oldData) {
				$.each($sessionSvc.data, function (idx, sess) {
					if (!oldData.find(function (elem) {
								return elem.id == sess.id;
							})
					) {
						sess.new = true;
					}
				});
			}
			$scope.deviceData = $sessionSvc.deviceData;
			$scope.sessionData = $sessionSvc.data;
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