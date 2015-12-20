/**
 * Created by Nguyen Duong Kim Hao on 15/12/2015.
 */

app.controller('DashboardCtrl', function ($scope, $cookies, $state, $location, $timeout) {
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
	$(window).bind("load resize", function () {
		if ($(this).width() < 769) {
			$('body').addClass('body-small')
		} else {
			$('body').removeClass('body-small')
		}
	});

// Remove focus
	$(".btn-nofocus").mouseup(function () {
		$(this).blur();
	});

	$scope.$state = $state;

});