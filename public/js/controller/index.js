/**
 * Created by Nguyen Duong Kim Hao on 14/12/2015.
 */

app.controller('HomeCtrl', function ($scope, $cookies, $location, $http) {
	$scope.alerts = {
		success: {
			text: '',
			show: false
		},
		error: {
			text: '',
			show: false
		},
		info: {
			text: 'Đăng nhập để sử dụng phần mềm',
			show: true
		},
	};

	$scope.validations = {
		username: {
			text: '',
			show: false
		},
		password: {
			text: '',
			show: false
		}
	};

	var showSuccess = function (message) {
		$scope.alerts.info.show = false;
		$scope.alerts.error.show = false;
		$scope.alerts.success.show = true;
		$scope.alerts.success.text = message;
	};

	var showError = function (message) {
		$scope.alerts.info.show = false;
		$scope.alerts.success.show = false;
		$scope.alerts.error.show = true;
		$scope.alerts.error.text = message;
	};

	var showInfo = function () {
		$scope.alerts.error.show = false;
		$scope.alerts.success.show = false;
		$scope.alerts.info.show = true;
	};

	var clearValidationErrors = function () {
		$scope.validations.username.show = false;
		$scope.validations.password.show = false;
	};

	var validate = function () {
		var validated = true;
		var regx = /^[A-Za-z0-9]+$/;
		if (!$scope.user.username || $scope.user.username == '') {
			$scope.validations.username.text = 'Hãy nhập tên đăng nhập';
			$scope.validations.username.show = true;
			validated = false;
		} else if ($scope.user.username.length < 3) {
			$scope.validations.username.text = 'Tên đăng nhập tối thiểu 3 kí tự';
			$scope.validations.username.show = true;
			validated = false;
		} else if (!regx.test($scope.user.username)) {
			$scope.validations.username.text = 'Tên đăng nhập không được chứa kí tự đặc biệt';
			$scope.validations.username.show = true;
			validated = false;
		}
		if (!$scope.user.password || $scope.user.password == '') {
			$scope.validations.password.text = 'Hãy nhập mật khẩu';
			$scope.validations.password.show = true;
			validated = false;
		} else if ($scope.user.password.length < 6) {
			$scope.validations.password.text = 'Mật khẩu tối thiểu 6 kí tự';
			$scope.validations.password.show = true;
			validated = false;
		}
		return validated;
	};

	$scope.user = {};

	$scope.login = function () {
		showInfo();
		clearValidationErrors();
		if (!validate()) {
			return;
		}
		$http.post('/api/user/login', $scope.user)
				.success(function (data, status) {
					if (status == 200) {
						$cookies.put('user', JSON.stringify(data));
						showSuccess('Đăng nhập thành công');
						window.loading_screen = pleaseWait(window.loadingScreenConfig);
						$location.path('/dashboard');
					}
				})
				.error(function (data, status) {
					if (status == 401) {
						showError('Tên đăng nhập hoặc mật khẩu sai');
					} else {
						showError('Xảy ra lỗi hệ thống, vui lòng thử lại sau');
					}
				});

	};
});