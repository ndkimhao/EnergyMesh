/**
 * Created by Nguyen Duong Kim Hao on 17/12/2015.
 */

app.controller('Dashboard.MainCtrl', function ($rootScope, $scope, $timeout, $socket, $sessionSvc) {

	var sessionData, deviceData, finishChartCallback;
	async.parallel(
			[
				function (callback) {
					finishChartCallback = callback;
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
						}, false)
					};
					realtimeChart.redraw();
				});
			});

	var realtimeChart;
	$timeout(function () {
		$('div#realtimeChart').highcharts({
			chart: {
				zoomType: 'x',
				type: 'spline',
				animation: Highcharts.svg,
				events: {
					load: function () {
						realtimeChart = this;
						finishChartCallback();
					}
				}
			},
			title: {text: 'Biểu đồ thời gian thực'},
			xAxis: {
				title: {text: 'Thời gian'},
				type: 'datetime'
			},
			tooltip: {
				formatter: function () {
					return '<b>' + this.series.name + '</b><br/>Thời gian: ' +
							Highcharts.dateFormat('%H:%M:%S', this.x) + '<br/>Công suất: ' +
							Highcharts.numberFormat(this.y, 2) + ' W';
				}
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
					var shift = realtimeChart.series[0].data.length >= 20;
					realtimeChart.series[0].addPoint([now, data.total], false, shift);

					var detail = data.detail;
					for (var sessId in detail) {
						if (detail.hasOwnProperty(sessId)) {
							deviceData[sessionData[sessId].device.id].series.addPoint(
									[now, detail[sessId]], false, shift
							);
						}
					}

					realtimeChart.redraw();

				}
			});
			$socket.io.emit('start data');
		});
	});
	$(function () {
		$timeout(function () {
			if (realtimeChart) {
				realtimeChart.reflow();
			}
		}, 50);
	});

});
