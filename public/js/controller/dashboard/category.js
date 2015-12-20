/**
 * Created by Nguyen Duong Kim Hao on 20/12/2015.
 */

app.controller('Dashboard.CategoryCtrl', function ($rootScope, $scope, $http, $em, Upload, $timeout, $categorySvc) {
	$('.footable').footable();
	$scope.$watchCollection('categoryData', function () {
		$timeout(function () {
			$('.footable').trigger('footable_redraw');
		});
	});

	$scope.newCat = {
		name: '',
		image: 'img/other/no-image.png'
	};

	$categorySvc.firstLoad(function () {
		$scope.categoryData = $categorySvc.data;
	});

	$scope.clearNewCategory = function () {
		$scope.newCat.name = '';
	};
	$scope.clearCategory = function (cat) {
		cat.newName = cat.name;
	};

	$scope.createCategory = function (cat) {
		$http.post('/api/category/', {
			name: cat.name
		}).success(function (data) {
			$em.success('Thêm danh mục thành công !', 2);
			cat.name = '';
			data.newName = data.name;
			$scope.categoryData.push(data);
		});
	};

	$scope.updateCategory = function (cat) {
		if (cat.newName == '') {
			$em.tInfo('Vui lòng nhập tên danh mục !', 2);
		} else {
			$http.put('/api/category/{0}'.format(cat.id), {
				name: cat.newName
			}).success(function (data) {
				$em.success('Cập nhật danh mục thành công !', 2);
				cat.name = cat.newName;
			});
		}
	};

	$scope.uploadCategoryClick = function (cat) {
		cat.oldImage = cat.image;
		cat.image = null;
		$scope.curCategory = cat;
	}

	$scope.uploadCategoryImage = function (file, cat) {
		Upload.upload({
			url: '/api/category/{0}/image'.format(cat.id),
			data: {image: file},
			method: 'PUT'
		}).then(function (res) {
			$timeout(function () {
				cat.image = '{0}?rand={1}'.format(res.data.image, Math.random() * 1000);
			}, 1);
		}, function (res) {
		}, function () {
		});
	};

	//$timeout(function () {
	//	var inputSelector = $('input[type=file]').on("click.filesSelector", function () {
	//		var cancelled = false;
	//		$timeout(function () {
	//			$(document).one("mousemove.filesSelector focusin.filesSelector", function () {
	//				if (inputSelector.val().length === 0 && !cancelled) {
	//					cancelled = true;
	//					$scope.$apply(function () {
	//						$scope.curCategory.image = $scope.curCategory.oldImage;
	//					});
	//				}
	//			});
	//		}, 2);
	//	});
	//});

	$scope.deleteCategory = function (cat) {
		$em.confirm('Bạn có chắc chắn muốn xóa danh mục ?', function () {
			$http.delete('/api/category/{0}'.format(cat.id))
				.success(function (data) {
					$em.success('Xóa danh mục thành công !', 2);
					$scope.categoryData.splice($scope.categoryData.indexOf(cat), 1);
				});
		});
	};
});