"use strict";
define([], function() {

  return ['$http', function($http) {
    var baseUrl = 'http://localhost:5000/connect'

    var transformRequestData = function(obj) {
      var str = [];
      for (var p in obj)
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
      return str.join("&");
    };

    var handleSuccess = function(res) {
      return {
        success: true,
        data: res.data,
      };
    };

    var handleError = function(res) {
      return {
        success: false,
        data: res.data
      };
    };

    return {
      authenticate: function(username, password, callback) {
        return $http({
          method: 'POST',
          url: baseUrl + '/token',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          transformRequest: function(data, headers) {
            return transformRequestData(data);
          },
          data: {
            grant_type: 'password',
            username: username,
            password: password,
            scope: "profile email openid"
          }
        }).then(callback, callback);
      }
    }
  }];
});
