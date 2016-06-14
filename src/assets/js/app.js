$(document).foundation();

// Init Angular
var app = angular.module('GeoLocation', []);

// Data Service
app.factory('dataService', ['$http', '$q', '$rootScope', function($http, $q, $rootScope) { 

	var dataService = {};

  	dataService.getLocation = function(host) {
  		var deferred = $q.defer();
  		if(host){
  			var api = 'http://ip-api.com/json/'+host;
  		} 
  		$http.get(api||'http://ip-api.com/json/')
  		.success(function(data){
  			deferred.resolve(data);
  		})
  		.error(function(data){
  			deferred.reject(data);
  		});
  		return deferred.promise;
  	}

  	return dataService;
	
}]);

// Controlers

app.controller('locationController', ['$scope', 'dataService', function($scope, dataService){

	$scope.myLocation = {};
	$scope.siteLocation = {};
	$scope.map = {};

  $scope.markers = [];
  $scope.now = new Date();

	// Get My Location
    $scope.getMyLocation = function(){
        dataService.getLocation()
        .then(function(data){
            $scope.myLocation = data;
            $scope.moveToLocation(data.lat,data.lon);
            if($scope.markers[0]) {
              $scope.removeMarker(0);
            }
            $scope.newMarker(data.lat,data.lon,0,'My Location');
        })
    }

    // Get Site Location
    $scope.getSiteLocation = function(){
        dataService.getLocation(this.site)
        .then(function(data){
            $scope.siteLocation = data;
            $scope.moveToLocation(data.lat,data.lon);
            if($scope.markers[1]) {
              $scope.removeMarker(1);
            }
            $scope.newMarker(data.lat,data.lon,1,this.site);
        })
    }

    $scope.moveToLocation = function(lat, lng){
        var center = new google.maps.LatLng(lat, lng);
        $scope.map.panTo(center);
    }

    $scope.newMarker = function(lat, lng, type, name){
      var marker = new google.maps.Marker({
        position: {lat: lat, lng: lng},
        map: $scope.map,
        title: name,
        animation: google.maps.Animation.DROP
      });
      $scope.markers[type] = marker;

      if($scope.markers[1]) {
        $scope.showAllMarkers();
      }

    }

    $scope.removeMarker = function(item) {
      $scope.markers[item].setMap(null);
    }

    $scope.showAllMarkers = function() {
      var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < $scope.markers.length; i++) {
         bounds.extend($scope.markers[i].getPosition());
        }
        $scope.map.fitBounds(bounds);
    }

    $scope.resetMyLocation = function(){
    	$scope.myLocation = {};
      $scope.removeMarker(0);
    }

    $scope.getMyLocation();
    $scope.map = dataService.map;

    // Help
    $(".field_name").click(function(e){
      var fieldName = $(e.currentTarget).closest('tr').find('.field_name').text();
      alert("This is your " + fieldName + " from ISP " + $scope.myLocation.isp + " at " + $scope.now);
    });

}]);

app.controller('mapController', ['$scope', 'dataService', function($scope, dataService){

	$scope.map = {};
	$scope.initMap = function() {
		$scope.map = new google.maps.Map(document.getElementById('map'), {
			center: {lat: -34.397, lng: 150.644},
			zoom: 10,
			scrollwheel: false,
			disableDefaultUI: true
		});
		dataService.map = $scope.map;
	}
	$scope.initMap();
}]);
