/**
 * Created by Nguyen Duong Kim Hao on 14/12/2015.
 */

app = angular.module('energyMeshApp',
		['ui.router', 'angular-loading-bar', 'ui.bootstrap', 'ngCookies',
			'toaster', 'ngAnimate', 'ngFileUpload', 'ngSanitize', 'cfp.loadingBar']);

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
		});
	$urlRouterProvider.when('/dashboard', '/dashboard/main');

	$locationProvider.html5Mode(true);

	Highcharts.setOptions({
		global: {
			useUTC: false
		}
	});
	moment.defineLocale('vi', {longDateFormat: {LT: 'hh:mm A'}});
});