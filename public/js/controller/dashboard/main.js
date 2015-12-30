/**
 * Created by Nguyen Duong Kim Hao on 17/12/2015.
 */

app.controller('Dashboard.MainCtrl', function ($rootScope, $scope, $timeout, $socket, $sessionSvc) {

	var sessionData, deviceData;
	var finishChartCallback = [null, null];
	var realtimeChart, realtimePie;
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
						series: realtimeChart.addSeries({
							name: elem.name,
							data: [],
							marker: {
								enabled: true,
								radius: 3
							}
							//yAxis: 1
						}, false),
						color: colors[count++]
					};
					realtimeChart.redraw();
			});
			});

	$timeout(function () {
		$('div#realtimeChart').highcharts({
			chart: {
				zoomType: 'x',
				type: 'spline',
				animation: Highcharts.svg,
				events: {
					load: function () {
						realtimeChart = this;
						if (finishChartCallback[0]) finishChartCallback[0]();
						finishChartCallback[0] = null;
					}
				}
			},
			title: {text: 'Biểu đồ thời gian thực'},
			xAxis: {
				title: {text: 'Thời gian'},
				type: 'datetime'
			},
			tooltip: {
				pointFormat: '<span style="color:{point.color}">\u25CF {series.name}:</span> {point.y:.2f} W<br/>',
				xDateFormat: '%H:%M:%S',
				headerFormat: 'Thời gian: {point.key}<br>',
				shared: true
			},
			yAxis: [
				{title: {text: 'Công suất (W)'}}
				//{title: {text: 'Công suất (W)'}, opposite: true}
			],
			series: [{
				name: 'Tổng',
				data: [],
				marker: {
					enabled: true,
					radius: 4
				}
			}]
		});

		$('div#realtimePieChart').highcharts({
			chart: {
				type: 'pie',
				options3d: {
					enabled: true,
					alpha: 45
				},
				events: {
					load: function () {
						realtimePie = this;
						if (finishChartCallback[1])finishChartCallback[1]();
						finishChartCallback[1] = null;
					}
				}
			},
			title: {text: 'Tỷ lệ tiêu thụ điện'},
			tooltip: {
				headerFormat: '<b>{point.key}: </b>',
				pointFormat: '{point.percentage:.2f}%'
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

		$scope.$on('$destroy', function () {
			$socket.io.emit('stop data');
			$socket.io.removeAllListeners('reatime data');
			if (realtimeChart) {
				try {
					realtimeChart.destroy();
					realtimeChart = null;
				} catch (e) {
				}
			}
		});

		$socket.firstLoad(function () {
			$socket.io.on('reatime data', function (data) {
				//console.log(data);
				if (realtimeChart) {

					var now = new Date().getTime();
					var totalPower = data.total;
					var remainPower = totalPower;
					var shift = realtimeChart.series[0].data.length >= 20;
					realtimeChart.series[0].addPoint([now, totalPower], false, shift);

					var pieData = [];
					var detailDevice = [];
					var detail = data.detail;
					for (var sessId in detail) {
						if (detail.hasOwnProperty(sessId)) {
							var sessDev = sessionData[sessId];
							if (sessDev) {
								var dev = sessDev.device;
								if (dev.id) {
									var devCustomObj = deviceData[dev.id];
									var power = detail[sessId];
									shift = devCustomObj.series.data.length >= 20;
									// TODO: remove series data if not received data
									devCustomObj.series.addPoint([now, power], false, shift);
									pieData.push({
										name: dev.name,
										y: power / totalPower * 100,
										color: devCustomObj.color
									});
									detailDevice.push({
										name: dev.name,
										power: power,
										//kwh: power * 5,
										//money: 17000,
										category: dev.category
									});
									remainPower -= power;
								}
							}
						}
					}
					if (remainPower > 1) {
						pieData.push({
							name: 'Chưa chọn',
							y: remainPower / totalPower * 100,
							color: '#FFF263'
						});
					}

					$scope.detailDevice = detailDevice;
					$scope.$digest();

					realtimePie.series[0].setData(pieData);
					realtimeChart.redraw();
				}
			});
			$socket.io.emit('start data');
		});
	});
	$(function () {
		setTimeout(function () {
			if (realtimeChart) realtimeChart.reflow();
			if (realtimePie) realtimePie.reflow();
		}, 50);
	});

	$('.footable').footable();
	$scope.$watchCollection('detailDevice', function () {
		$timeout(function () {
			$('.footable').trigger('footable_redraw');
		});
	});

});
