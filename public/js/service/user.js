/**
 * Created by Nguyen Duong Kim Hao on 15/12/2015.
 */

app.factory('UserSvc', function ($http) {

	var users = {
		login: function (user) {
			return $http.post('/api/user/login', user);
		},
	};

	return users;

});