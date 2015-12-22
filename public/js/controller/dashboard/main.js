/**
 * Created by Nguyen Duong Kim Hao on 17/12/2015.
 */

app.controller('Dashboard.MainCtrl', function ($rootScope, $scope, $timeout, $socket) {
	var realtimeChart;
	$timeout(function () {
		realtimeChart = $('div#realtimeChart').highcharts({
			chart: {
				zoomType: 'x',
				animation: Highcharts.svg
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
			yAxis: {title: {text: 'Công suất (W)'}},
			series: [{
				type: 'spline',
				name: 'Tổng',
				data: [],
				marker: {
					enabled: true,
					radius: 4
				}
			}]
		}).highcharts();

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
				var point = [new Date().getTime(), data.total];

				if (realtimeChart) {
					var shift = realtimeChart.series[0].data.length >= 20;
					realtimeChart.series[0].addPoint(point, true, shift, true);
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
