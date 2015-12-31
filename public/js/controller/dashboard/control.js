/**
 * Created by Nguyen Duong Kim Hao on 31/12/2015.
 */

app.controller('Dashboard.ControlCtrl', function ($scope, $deviceSvc, $em, $http) {

	$deviceSvc.getControllableDevice(function (data) {
		$scope.controllableDevice = data;
	});

	$scope.turnDevice = function (dev) {
		dev.isOn = !dev.isOn;

		$http
				.post('/api/device/control/{0}'.format(dev.id), {
					isOn: dev.isOn
				})
				.success(function () {
					if (dev.isOn)
						$em.tInfo('Gừi lệnh bật thiết bị thành công !', 2);
					else
						$em.tInfo('Gừi lệnh tắt thiết bị liệu thành công !', 2);
				});

	};

});