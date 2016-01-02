/**
 * Created by Nguyen Duong Kim Hao on 15/12/2015.
 */

app.controller('DashboardCtrl', function ($scope, $cookies, $state, $location, $timeout, $em) {
	var usrString = $cookies.get('user');
	if (!usrString) {
		$location.path('/');
		return;
	}
	$scope.user = JSON.parse(usrString);

	$scope.logout = function () {
		$em.confirm('Bạn có chắc chắn muốn đăng xuất ?', function () {
			var cookies = $cookies.getAll();
			angular.forEach(cookies, function (v, k) {
				$cookies.remove(k);
			});
			$location.path('/');
			$scope.$apply();
			$em.success('Đăng xuất thành công !', 2);
		});
	};

	//$location.path('/dashboard/main');
	if (!String.prototype.format) {
		String.prototype.format = function () {
			var args = arguments;
			return this.replace(/{(\d+)}/g, function (match, number) {
				return typeof args[number] != 'undefined'
						? args[number]
						: match
						;
			});
		};
	}

	// Move right sidebar top after scroll
	$(window).scroll(function () {
		if ($(window).scrollTop() > 0) {
			$('#right-sidebar').addClass('sidebar-top');
		} else {
			$('#right-sidebar').removeClass('sidebar-top');
		}
	});

// Minimalize menu when screen is less than 768px
	$(window).bind('load resize', function () {
		if ($(this).width() < 769) {
			$('body').addClass('body-small')
		} else {
			$('body').removeClass('body-small')
		}
	});
	$(function () {
		if ($(this).width() < 769) {
			$('body').addClass('body-small')
		} else {
			$('body').removeClass('body-small')
		}
	});

	$(function () {
		$('div#div-body-container').mCustomScrollbar({
			axis: 'y',
			theme: 'minimal-dark',
			scrollInertia: 250
		});
	});

	$scope.$state = $state;

	$(function () {
		if (window.loading_screen) {
			window.loading_screen.finish();
			window.loading_screen = null;
		}
	});

});