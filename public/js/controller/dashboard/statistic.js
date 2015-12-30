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
					hourlyChart.series.forEach(function (elem) {
						elem.setData(function () {
							var ret = [];
							for (var i = 1; i <= 24; i++) {
								ret.push(0);
							}
							return ret;
						}());
					});
					var overallTotal = [];
					data.forEach(function (elem) {
						var time = new Date(elem.start).getTime();
						var devCusObj = deviceData[sessionData[elem.sessionId].device.id];
						var seriesOverall = devCusObj.seriesOverall;
						var seriesHourly = devCusObj.seriesHourly;
						var gap = elem.gap;
						var kwhFactor = (gap / (1000 * 60 * 60));

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

							var date = new Date(time);
							var hour = date.getHours() - 1;
							var work = dat * kwhFactor;
							seriesHourly.data[hour].update([hour,
								seriesHourly.data[hour].y + work], false);

							time += gap;
					});
						seriesOverall.addPoint([time + 1, null], false);
						overallTotal.push([time + 1, null]);
				});
					overallChart.series[0].setData(overallTotal);
					overallChart.redraw();
					hourlyChart.redraw();
				});
	};

	var sessionData, deviceData;
	var overallChart, hourlyChart;
	var finishChartCallback = [null, null];
	async.parallel(
			[
				function (callback) {
					finishChartCallback[0] = callback;
				},
				function (callback) {
					finishChartCallback[1] = callback;
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
							data: []
						}, false),
						seriesHourly: hourlyChart.addSeries({
							name: elem.name,
							data: function () {
								var ret = [];
								for (var i = 1; i <= 24; i++) {
									ret.push(0);
								}
								return ret;
							}()
						}, false),
						color: colors[count++]
					};
			});
				hourlyChart.redraw();
			});

	$(function () {
		setTimeout(function () {
			$('#overallChart').highcharts('StockChart', {
				chart: {
					type: 'spline',
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
					data: []
				}],
				legend: {enabled: true},
				tooltip: {
					pointFormat: '<span style="color:{point.color}">\u25CF {series.name}:</span> {point.y:.2f} W<br/>',
					xDateFormat: '%H:%M:%S',
					headerFormat: 'Thời gian: {point.key}<br>',
					shared: true
				}
			});

			$('#hourlyChart').highcharts({
				chart: {
					type: 'column',
					zoomType: 'x',
					events: {
						load: function () {
							hourlyChart = this;
							if (finishChartCallback[1]) finishChartCallback[1]();
							finishChartCallback[1] = null;
						}
					}
				},
				title: {text: 'Thống kê theo giờ'},
				xAxis: {
					categories: function () {
						var ret = [];
						for (var i = 1; i <= 24; i++) {
							ret.push(i + ' giờ');
						}
						return ret;
					}(),
					title: {text: 'Giờ trong ngày'}
				},
				yAxis: {
					title: {text: 'Điện năng (kWh)'},
					stackLabels: {
						enabled: true,
						format: '{total:.2f}'
					}
				},
				tooltip: {
					pointFormat: '<span style="color:{point.color}">\u25CF {series.name}:</span> {point.y:.2f} W<br/><b>Tổng cộng: </b>{point.stackTotal:.2f}',
					headerFormat: 'Thời gian: {point.key}<br>',
				},
				plotOptions: {
					column: {
						stacking: 'normal',
						dataLabels: {
							enabled: true,
							formatter: function () {
								if (this.y > 0.5)
									return Math.ceil(this.y * 10) / 10;
							}
						}
					}
				},
				series: []
			});
		}, 50);
	});
});