/**
 * Created by Nguyen Duong Kim Hao on 23/12/2015.
 */

app.controller('Dashboard.StatisticCtrl', function ($scope, $http, $sessionSvc, cfpLoadingBar, $em) {
	$scope.search = {
		start: moment().add(-2, 'days').startOf('hour').toDate(),
		end: new Date()
	};

	$scope.makeTimeCalendar = function (date) {
		return moment(date).calendar();
	};

	$scope.refresh = function () {
		cfpLoadingBar.start();
		$http
				.post('/api/statistic/all', $scope.search)
				.success(function (data) {
					cfpLoadingBar.inc();
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
					pieChart.series[0].data.forEach(function (elem) {
						elem.update([0, 0], false);
					});
					$.each(deviceData, function (id, elem) {
						elem.detail.totalWork = 0;
					});
					cfpLoadingBar.inc();
					var overallTotal = [];
					data.forEach(function (elem) {
						var time = new Date(elem.start).getTime();
						var devCusObj = deviceData[sessionData[elem.sessionId].device.id];
						var seriesOverall = devCusObj.seriesOverall;
						var seriesHourly = devCusObj.seriesHourly;
						var pie = devCusObj.pie;
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
							pie.update([0, pie.y + work], false);
							devCusObj.detail.totalWork += work;

							time += gap;
					});
						seriesOverall.addPoint([time + 1, null], false);
						overallTotal.push([time + 1, null]);
				});
					cfpLoadingBar.inc();
					overallChart.series[0].setData(overallTotal);
					overallChart.redraw();
					hourlyChart.redraw();
					pieChart.redraw();
					$scope.detailDevice.forEach(function (elem) {
						elem.money = elem.totalWork * 1750;
						var dur = ($scope.search.end.getTime() - $scope.search.start.getTime()) / 1000;
						elem.moneyMonthly = (elem.money / dur) * (60 * 60 * 24 * 30);
						elem.moneyYearly = elem.moneyMonthly * 12;
				});

					cfpLoadingBar.complete();
					$em.tInfo('Thống kê dữ liệu thành công !', 2);
				});
	};

	var sessionData, deviceData;
	var overallChart, hourlyChart, pieChart;
	var finishChartCallback = [null, null, null];
	async.parallel(
			[
				function (callback) {
					finishChartCallback[0] = callback;
				},
				function (callback) {
					finishChartCallback[1] = callback;
				},
				function (callback) {
					finishChartCallback[2] = callback;
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
				var arrPieData = [];
				$scope.detailDevice = [];
				$sessionSvc.deviceData.forEach(function (elem) {
					var devDat = deviceData[elem.id] = {
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
						pie: {
							name: elem.name,
							y: 0,
							color: colors[count]
						},
						detail: {
							dev: elem,
							totalWork: 0,
							money: 0,
							moneyMonthly: 0,
							moneyYearly: 0
						},
						color: colors[count++]
					};
					arrPieData.push(devDat.pie);
					$scope.detailDevice.push(devDat.detail);
			});
				hourlyChart.redraw();
				pieChart.series[0].setData(arrPieData);
				var i = 0;
				$.each(deviceData, function (id, elem) {
					elem.pie = pieChart.series[0].data[i++];
			});
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

			$('#pieChart').highcharts({
				chart: {
					type: 'pie',
					options3d: {
						enabled: true,
						alpha: 45
					},
					events: {
						load: function () {
							pieChart = this;
							if (finishChartCallback[2])finishChartCallback[2]();
							finishChartCallback[2] = null;
						}
					}
				},
				title: {text: 'Tỷ lệ tiêu thụ điện'},
				tooltip: {
					headerFormat: '<b>{point.key}: </b>',
					pointFormat: '{point.y:.2f} kWh ({point.percentage:.2f}%)'
				},
				plotOptions: {
					pie: {
						allowPointSelect: true,
						cursor: 'pointer',
						depth: 35,
						dataLabels: {enabled: false},
						showInLegend: true
					}
				},
				series: [{
					type: 'pie',
					data: []
				}]
			});
		}, 50);

		$('.footable').footable();
		$scope.$watchCollection('detailDevice', function () {
			setTimeout(function () {
				$('.footable').trigger('footable_redraw');
			});
		});
	});
});