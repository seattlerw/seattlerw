'use strict';

angular.module('seattlerwApp')
.controller('MainCtrl', function ($scope, $http) {

	$scope.refresh = function() {
		$http.get('/scripts/seattlerw.json').then(function(response) {
			$scope.restaurants = response.data.sort(compare).reverse();
		});
	}

	$scope.refresh();

	function compare(a,b) {
		try{
			if(a.yelp == null || a.yelp.businesses.length == 0) {
				return -1;
			}
			if( b.yelp == null || b.yelp.businesses.length == 0) {
				return 1;
			}
			if (a.yelp.businesses[0].rating < b.yelp.businesses[0].rating)
				return -1;
			if (a.yelp.businesses[0].rating > b.yelp.businesses[0].rating)
				return 1;
			return 0;
		}
		catch(exp) {
			console.log(a);
			consoloe.log(b);
			console.log(exp);
		}
	}


});
