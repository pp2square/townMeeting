angular.module('townMetting.services', [])
  .factory('connServer', function($http, $q) {

    var baseURL = 'http://192.168.0.99:3333';  // Only use external Server

    return {
      getHttp: function(path, successCB, errorCB) {
        $http.get(path).success(successCB).error(errorCB);
      },

      postHttp: function(path, data, successCB, errorCB) {
        $http.post(path, data).success(successCB).error(errorCB);
      }
    };
});