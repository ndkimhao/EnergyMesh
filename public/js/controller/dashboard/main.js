/**
 * Created by Nguyen Duong Kim Hao on 17/12/2015.
 */

app.controller('Dashboard.MainCtrl', function ($rootScope, $scope, $timeout, $socket, $realtimeData) {
	var realtimeChart;
	$timeout(function () {
		var totalData = [];
		if ($realtimeData.total.length > 0) {
			$.each($realtimeData.total, function (idx, elem) {
				totalData.push(elem);
			});
		}

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
				data: totalData,
				marker: {
					enabled: true,
					radius: 4
				}
			}]
		}).highcharts();

		$scope.$on('$destroy', function () {
			if (realtimeChart) {
				try {
					realtimeChart.destroy();
					realtimeChart = null;
					console.log('as')
				} catch (e) {
				}
			}
		});

		$socket.firstLoad(function () {
			$socket.io.on('reatime-data', function (data) {
				var point = [new Date().getTime(), data.total];

				if (realtimeChart) {
					var shift = realtimeChart.series[0].data.length >= 20;
					realtimeChart.series[0].addPoint(point, true, shift, true);
				}

				$realtimeData.total.push(point);
				$realtimeData.tidy();
			});
		});
	});
	$(function () {
		$timeout(function () {
			if (realtimeChart) {
				realtimeChart.reflow();
			}
		}, 50);
	});

//$timeout(function () {
//	$scope.chartConfig = {
//		options: {
//			chart: {zoomType: 'x'},
//			yAxis: {title: {text: 'Công suất (W)'}},
//			title: {text: 'Biểu đồ thời gian thực'},
//			legend: {enabled: true}
//		},
//		xAxis: {
//			title: {text: 'Thời gian'},
//			type: 'datetime'
//		},
//		series: [{
//			name: 'Tổng',
//			type: 'spline',
//			data: $realtimeData.total
//		}],
//		func: function (chart) {
//			//setup some logic for the chart
//		}
//	};
//	$socket.firstLoad(function() {
//		$socket.io.on('reatime-data', function (data) {
//			$scope.$apply(function() {
//				console.log(data);
//				$realtimeData.total.push([new Date().getTime(), data.total]);
//				$realtimeData.tidy();
//				$scope.chartConfig.getHighcharts().redraw();
//			});
//		});
//	});
//});
});
