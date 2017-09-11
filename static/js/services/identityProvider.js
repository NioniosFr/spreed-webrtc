"use strict";
define([], function() {

  return ['$http', 'globalContext', function($http, globalContext) {
    var baseUrl = globalContext.Cfg.IdentityProviderURI;

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
      authenticate: function(username, password, succ_callback, err_callback) {
        return $http({
          method: 'POST',
          url: baseUrl + '/connect/token',
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
        }).then(succ_callback, err_callback);
      }
    }
  }];
});
