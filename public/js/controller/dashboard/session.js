/**
 * Created by Nguyen Duong Kim Hao on 20/12/2015.
 */

app.controller('Dashboard.SessionCtrl', function ($scope, $http, $timeout, $deviceSvc, $sce) {
	$('.footable').footable();
	$scope.$watchCollection('sessionData', function () {
		$timeout(function () {
			$('.footable').trigger('footable_redraw');
		});
	});
	$scope.moment = window.moment;

	var tmpSessData;
	async.parallel([function (callback) {
		$deviceSvc.loadDeviceAndCategory(function (devData) {
			$scope.deviceData = devData;
			callback();
		});
	}, function (callback) {
		$http.get('/api/session').success(function (data) {
			tmpSessData = data;
			callback();
		});
	}], function () {
		$.each(tmpSessData, function (idx, sess) {
			if (sess.device) {
				sess.device = $scope.deviceData.find(function (dev) {
					return dev.id == sess.device.id;
				});
			}
		});
		$scope.sessionData = tmpSessData;
	});

	function toTitleCase(str) {
		return str.replace(/\w\S*/g, function (txt) {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		});
	}

	$scope.makeTimeTooltip = function (date) {
		var mm = moment(date);
		return '<b>' + mm.calendar() + '</b><br>' + toTitleCase(mm.format('dddd, DD MMMM, YYYY'));
	};
});