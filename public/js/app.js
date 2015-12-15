/**
 * Created by Nguyen Duong Kim Hao on 14/12/2015.
 */

var app = angular.module('energyMeshApp',
	['ui.router', 'angular-loading-bar', 'ui.bootstrap']);

app.config(function ($stateProvider, $urlRouterProvider, $locationProvider, cfpLoadingBarProvider) {
	"use strict";

	cfpLoadingBarProvider.includeSpinner = false;
	$urlRouterProvider.otherwise('/');

	$stateProvider
		.state('home', {
			url: '/',
			templateUrl: './views/home.html',
			controller: 'HomeCtrl'
		});
	$locationProvider.html5Mode(true);
});