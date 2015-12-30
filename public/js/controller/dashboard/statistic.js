/**
 * Created by Nguyen Duong Kim Hao on 23/12/2015.
 */

app.controller('Dashboard.StatisticCtrl', function ($scope, $http, $sessionSvc) {
	$scope.search = {
		start: moment().add(-2, 'days').startOf('hour').toDate(),
		end: new Date()
	};

	$scope.makeTimeCalendar = function (date) {
		return moment(date).calendar();
	};

	$scope.refresh = function () {
		$http
				.post('/api/statistic/all', $scope.search)
				.success(function (data) {
					//console.log(data);
					overallChart.series.forEach(function (elem) {
						elem.setData([]);
					});
					var overallTotal = [];
					data.forEach(function (elem) {
						var time = new Date(elem.start).getTime();
						var seriesOverall =
								deviceData[sessionData[elem.sessionId].device.id].seriesOverall;
						var gap = elem.gap;

						elem.data.forEach(function (dat) {
							seriesOverall.addPoint([time, dat], false);

							var ot = overallTotal.find(function (e) {
								return e[0] == time;
							});
							if (!ot) {
								ot = [time, 0];
								overallTotal.push(ot);
							}
							ot[1] += dat;

							time += gap;
						});
						seriesOverall.addPoint([time + 1, null], false);
						overallTotal.push([time + 1, null]);
					});
					overallChart.series[0].setData(overallTotal);
					overallChart.redraw();
				});
	};

	var sessionData, deviceData;
	var overallChart;
	var finishChartCallback = [null];
	async.parallel(
			[
				function (callback) {
					finishChartCallback[0] = callback;
				},
				function (callback) {
					$sessionSvc.load(function () {
						sessionData = {};
						$sessionSvc.data.forEach(function (elem) {
							sessionData[elem.sessionId] = elem;
						});
						deviceData = {};
						callback();
					});
				}
			], function () {
				var count = 1;
				var colors = Highcharts.getOptions().colors;
				$sessionSvc.deviceData.forEach(function (elem) {
					deviceData[elem.id] = {
						obj: elem,
						seriesOverall: overallChart.addSeries({
							name: elem.name,
							type: 'spline',
							data: []
						}, false),
						color: colors[count++]
					};
				});
			});

	$(function () {
		setTimeout(function () {
			$('#overallChart').highcharts('StockChart', {
				chart: {
					zoomType: 'x',
					events: {
						load: function () {
							overallChart = this;
							if (finishChartCallback[0]) finishChartCallback[0]();
							finishChartCallback[0] = null;
						}
					}
				},
				rangeSelector: {
					buttons: [
						{count: 15, type: 'minute', text: '15m'},
						{count: 30, type: 'minute', text: '30m'},
						{count: 1, type: 'hour', text: '1h'},
						{count: 2, type: 'hour', text: '2h'},
						{count: 3, type: 'hour', text: '3h'},
						{count: 1, type: 'day', text: '1d'},
						{count: 3, type: 'day', text: '3d'},
						{count: 1, type: 'week', text: '1w'},
						{count: 1, type: 'month', text: '1m'},
						{type: 'all', text: 'All'}
					],
					allButtonsEnabled: true,
					selected: 0
				},
				//xAxis: {
				//	type: 'datetime',
				//	ordinal: false
				//},
				yAxis: {title: {text: 'Công suất (W)'}},
				title: {text: 'Biểu đồ tổng quan'},
				series: [{
					name: 'Tổng',
					type: 'spline',
					data: []
				}],
				legend: {enabled: true},
				tooltip: {
					pointFormat: '<span style="color:{point.color}">\u25CF {series.name}:</span> {point.y:.2f} W<br/>',
					xDateFormat: '%H:%M:%S',
					headerFormat: 'Thời gian: {point.key}<br>',
					shared: true
				},
			});
		}, 50);
	});
});