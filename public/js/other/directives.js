/**
 * INSPINIA - Responsive Admin Theme
 *
 */

app
	.directive('pageTitle', function pageTitle($rootScope, $timeout) {
		return {
			link: function (scope, element) {
				var listener = function (event, toState, toParams, fromState, fromParams) {
					var title = 'Energy Mesh | Trang chủ';
					if (toState.data && toState.data.pageTitle) title = 'E-M | ' + toState.data.pageTitle;
					$timeout(function () {
						element.text(title);
					});
				};
				$rootScope.$on('$stateChangeStart', listener);
			}
		}
	})
	.directive('minimalizaSidebar', function minimalizaSidebar($timeout) {
		return {
			restrict: 'A',
			template: '<a class="navbar-minimalize minimalize-styl-2 btn btn-primary " href="" ng-click="minimalize()"><i class="fa fa-bars"></i></a>',
			controller: function ($scope, $element) {
				$scope.minimalize = function () {
					$("body").toggleClass("mini-navbar");
					if (!$('body').hasClass('mini-navbar') || $('body').hasClass('body-small')) {
						// Hide menu in order to smoothly turn on when maximize menu
						$('#side-menu').hide();
						// For smoothly turn on menu
						setTimeout(
							function () {
								$('#side-menu').fadeIn(500);
							}, 100);
					} else if ($('body').hasClass('fixed-sidebar')) {
						$('#side-menu').hide();
						setTimeout(
							function () {
								$('#side-menu').fadeIn(500);
							}, 300);
					} else {
						// Remove all inline style from jquery fadeIn function to reset menu state
						$('#side-menu').removeAttr('style');
					}
				}
			}
		};
	});