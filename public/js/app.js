/**
 * Created by Nguyen Duong Kim Hao on 14/12/2015.
 */

app = angular.module('energyMeshApp',
		['ui.router', 'angular-loading-bar', 'ui.bootstrap', 'ngCookies', 'amChartsDirective']);

app.config(function ($stateProvider, $urlRouterProvider, $locationProvider, cfpLoadingBarProvider) {
	"use strict";

	cfpLoadingBarProvider.includeSpinner = false;
	$urlRouterProvider.otherwise('/');

	$stateProvider
		.state('home', {
			url: '/',
			templateUrl: './views/home.html',
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
				//controller: 'DashboardCtrl'
			})
			.state('dashboard.userDetail', {
				url: '/userDetail',
				templateUrl: './views/dashboard/userDetail.html',
				//controller: 'DashboardCtrl'
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

});