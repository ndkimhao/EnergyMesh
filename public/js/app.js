/**
 * Created by Nguyen Duong Kim Hao on 14/12/2015.
 */

app = angular.module('energyMeshApp',
		['ui.router', 'angular-loading-bar', 'ui.bootstrap', 'ngCookies',
			'toaster', 'ngAnimate', 'ngFileUpload', 'ngSanitize', 'cfp.loadingBar',
			'ui.bootstrap.datetimepicker']);

app.config(function ($stateProvider, $urlRouterProvider, $locationProvider, cfpLoadingBarProvider) {
	"use strict";

	//cfpLoadingBarProvider.includeSpinner = false;
	$urlRouterProvider.otherwise('/');

	$stateProvider
		.state('home', {
			url: '/',
			templateUrl: './views/index.html',
			controller: 'HomeCtrl'
		})
			.state('dashboard', {
				url: '/dashboard',
				templateUrl: './views/dashboard.html',
				controller: 'DashboardCtrl',
				abstract: true,
				redirectTo: 'dashboard.main'
			})
			.state('dashboard.main', {
				url: '/main',
				templateUrl: './views/dashboard/main.html',
				controller: 'Dashboard.MainCtrl',
				data: {pageTitle: 'Dashboard'}
			})
			.state('dashboard.device', {
				url: '/device',
				templateUrl: './views/dashboard/device.html',
				controller: 'Dashboard.DeviceCtrl',
				data: {pageTitle: 'Thiết bị'}
			})
			.state('dashboard.category', {
				url: '/category',
				templateUrl: './views/dashboard/category.html',
				controller: 'Dashboard.CategoryCtrl',
				data: {pageTitle: 'Danh mục thiết bị'}
			})
			.state('dashboard.session', {
				url: '/session',
				templateUrl: './views/dashboard/session.html',
				controller: 'Dashboard.SessionCtrl',
				data: {pageTitle: 'Phiên đo'}
			})
			.state('dashboard.statistic', {
				url: '/statistic',
				templateUrl: './views/dashboard/statistic.html',
				controller: 'Dashboard.StatisticCtrl',
				data: {pageTitle: 'Thống kê'}
			})
			.state('dashboard.control', {
				url: '/control',
				templateUrl: './views/dashboard/control.html',
				controller: 'Dashboard.ControlCtrl',
				data: {pageTitle: 'Điều khiển thiết bị'}
		});
	$urlRouterProvider.when('/dashboard', '/dashboard/main');

	$locationProvider.html5Mode(true);

	Highcharts.setOptions({
		global: {
			useUTC: false
		}
	});
	moment.defineLocale('vi', {
		longDateFormat: {
			LT: 'hh:mm A',
			LTS: 'hh:mm:ss A',
			L: 'DD/MM/YYYY',
			LL: 'D MMMM [năm] YYYY',
			LLL: 'D MMMM [năm] YYYY HH:mm',
			LLLL: 'dddd, D MMMM [năm] YYYY HH:mm',
			l: 'DD/M/YYYY',
			ll: 'D MMM YYYY',
			lll: 'D MMM YYYY HH:mm',
			llll: 'ddd, D MMM YYYY HH:mm'
		},
		calendar: {
			sameDay: '[Hôm nay lúc] LT',
			nextDay: '[Ngày mai lúc] LT',
			nextWeek: 'dddd [tuần tới lúc] LT',
			lastDay: '[Hôm qua lúc] LT',
			lastWeek: 'dddd [tuần rồi lúc] LT',
			sameElse: 'L [lúc] LT'
		}
	});
});