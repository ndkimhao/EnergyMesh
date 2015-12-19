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
	});