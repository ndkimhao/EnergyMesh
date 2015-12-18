/**
 * Created by Nguyen Duong Kim Hao on 17/12/2015.
 */

app.controller('Dashboard.MainCtrl', function ($rootScope, $scope, $timeout, $q) {
	Highcharts.setOptions({
		global: {
			useUTC: false
		}
	});

	var time = (new Date()).getTime()
	$scope.chartConfig = {
		options: {
			chart: {
				events: {
					load: function () {
						var chart = this;
						var f;
						setInterval(f = function () {
							var x = (new Date()).getTime(), // current time
									y = Math.round(Math.random() * 100);
							chart.series[0].addPoint([x, Math.random() < 0.1 ? null : y], false, true);
							chart.series[1].addPoint([x, Math.random() < 0.1 ? null : y * Math.random()], false, true);
							chart.series[2].addPoint([x, Math.random() < 0.1 ? null : y * Math.random()], true, true);
						}, 1000);
					}
				},
			},

			rangeSelector: {
				buttons: [{
					count: 1,
					type: 'minute',
					text: '1M'
				}, {
					count: 5,
					type: 'minute',
					text: '5M'
				}, {
					type: 'all',
					text: 'All'
				}],
				inputEnabled: false,
				selected: 0
			},

			title: {
				text: 'Live random data'
			},

			exporting: {
				enabled: true
			},
			navigator: {
				enabled: true
			},
			legend: {
				enabled: true
			}

		},
		series: [{
			name: 'Random data',
			type: "spline",
			data: (function () {
				// generate an array of random data
				var data = [], time = (new Date()).getTime(), i;

				for (i = -999; i <= 0; i += 1) {
					data.push([
						time + i * 1000,
						Math.round(Math.random() * 100)
					]);
				}
				return data;
			}())
		}, {
			name: 'Data 1',
			type: "bar",
			data: (function () {
				// generate an array of random data
				var data = [], i;

				for (i = -99; i <= 0; i += 1) {
					data.push([
						time + i * 1000,
						Math.round(Math.random() * 100)
					]);
				}
				return data;
			}()),
			visible: false
		}, {
			name: 'Data 2',
			type: "bar",
			data: (function () {
				// generate an array of random data
				var data = [], i;

				for (i = -99; i <= 0; i += 1) {
					data.push([
						time + i * 1000,
						Math.round(Math.random() * 100)
					]);
				}
				return data;
			}()),
			visible: false
		}, {
			type: 'pie',
			name: 'Total consumption',
			data: [
				{
					name: 'John',
					y: 23,
					color: Highcharts.getOptions().colors[1] // John's color
				}, {
					name: 'Joe',
					y: 19,
					color: Highcharts.getOptions().colors[2] // Joe's color
				}],
			center: [20, 20],
			size: 100,
			showInLegend: false,
			dataLabels: {
				enabled: false
			}
		}],

		useHighStocks: true,
		func: function (chart) {
			$timeout(function () {
				chart.reflow();
			});
		}
	}

	//$timeout(function () {
	//	var d = $scope.chartConfig.series[0].data;
	//	d.push.apply(d, data1);
	//	/*var chart = $scope.chartConfig.getHighcharts();
	//	for (var i = 0; i < data1.length; i++) {
	//		chart.series[0].addPoint(data1[i], false, true);
	//	}
	//	chart.redraw();*/
	//}, 1500)
});
