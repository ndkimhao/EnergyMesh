/**
 * Created by Nguyen Duong Kim Hao on 14/12/2015.
 */

app = angular.module('energyMeshApp',
		['ui.router', 'angular-loading-bar', 'ui.bootstrap', 'ngCookies', 'highcharts-ng',
			'toaster', 'ngAnimate', 'ngFileUpload']);

app.config(function ($stateProvider, $urlRouterProvider, $locationProvider, cfpLoadingBarProvider) {
	"use strict";

	cfpLoadingBarProvider.includeSpinner = false;
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
		});
	$urlRouterProvider.when('/dashboard', '/dashboard/main');

	$locationProvider.html5Mode(true);

	var socket = io({
		path: '/api/realtime/socket'
	});
	socket.on('connection accepted', function (data) {
		app.factory('socket', function () {
			return socket;
		});
		socket.emit('connection established');
	});

	$(function () {
		$('div#div-body-container').slimScroll({
			height: '100%'
		});
	});
});