/**
 * Created by Nguyen Duong Kim Hao on 18/12/2015.
 */

app.controller('Dashboard.DeviceCtrl', function ($scope, $http, $em,
                                                 Upload, $timeout, $categorySvc, $deviceSvc) {
	$scope.clearNewDev = function () {
		$scope.devNew = {
			name: '',
			category: $scope.categoryData[0]
		};
	};

	$deviceSvc.loadDeviceAndCategory(function (devData, catData) {
		$scope.categoryData = catData;
		$scope.deviceData = devData;
		$scope.clearNewDev();
	});

	$scope.isChanged = function (dev) {
		return !angular.equals(dev, dev.$new);
	};

	$scope.categoryChange = function (dev, cat) {
		dev.category = cat;
	};

	$scope.clear = function (dev) {
		dev.$new = $.extend({}, dev);
	};

	$scope.update = function (dev) {
		if (dev.$new.name == '') {
			$em.tInfo('Vui lòng nhập tên thiết bị !', 2);
		} else {
			$http
					.put('/api/device/{0}'.format(dev.id), dev.$new)
					.success(function (data) {
						$em.success('Cập nhật thiết bị thành công !', 2);
						$.extend(dev, dev.$new);
						dev.$new = $.extend({}, dev);
					});
		}
	};

	$scope.create = function (dev) {
		var devNew = $scope.devNew;
		$http
				.post('/api/device', devNew)
				.success(function (data) {
					$em.success('Thêm thiết bị thành công !', 2);
					$scope.deviceData.push(devNew);
					devNew.$new = $.extend({}, devNew);
					$scope.clearNewDev();
				});
	};

	$scope.delete = function (dev) {
		$em.confirm('Bạn có chắc chắn muốn xóa thiết bị ?', function () {
			$http
					.delete('/api/device/{0}'.format(dev.id))
					.success(function (data) {
						$em.success('Xóa thiết bị thành công !', 2);
						$scope.deviceData.splice($scope.deviceData.indexOf(dev), 1);
					});
		});
	};

	$('.footable').footable();
	$scope.$watchCollection('deviceData', function () {
		$timeout(function () {
			$('.footable').trigger('footable_redraw');
		});
	});

});