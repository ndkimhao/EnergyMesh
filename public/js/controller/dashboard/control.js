/**
 * Created by Nguyen Duong Kim Hao on 31/12/2015.
 */

app.controller('Dashboard.ControlCtrl', function ($scope, $deviceSvc, $em) {

	$deviceSvc.getControllableDevice(function (data) {
		$scope.controllableDevice = data;
	});

	$scope.turnDevice = function (dev) {
		dev.isOn = !dev.isOn;
		if (dev.isOn)
			$em.tInfo('Gừi lệnh bật thiết bị thành công !', 2);
		else
			$em.tInfo('Gừi lệnh tắt thiết bị liệu thành công !', 2);
	};

});