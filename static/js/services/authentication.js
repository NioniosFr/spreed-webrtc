"use strict";

define([], function() {
  return ['$http', '$rootScope', '$timeout',
    function($http, $rootScope, $timeout) {
      // function Login(username, password, callback) {
      //
      //     /* Dummy authentication for testing, uses $timeout to simulate api call
      //      ----------------------------------------------*/
      //     $timeout(function () {
      //         var response;
      //         UserService.GetByUsername(username)
      //             .then(function (user) {
      //                 if (user !== null && user.password === password) {
      //                     response = { success: true };
      //                 } else {
      //                     response = { success: false, message: 'Username or password is incorrect' };
      //                 }
      //                 callback(response);
      //             });
      //     }, 1000);
      //
      //     /* Use this for real authentication
      //      ----------------------------------------------*/
      //     //$http.post('/api/authenticate', { username: username, password: password })
      //     //    .success(function (response) {
      //     //        callback(response);
      //     //    });
      //
      // }

      // authentication
      return {
        setCredentials: function(username, password, data) {
          //var authdata = $base64.encode(username + ':' + password);

          $rootScope.globals = {
            currentUser: {
              username: username,
              authdata: "data",
              data: data
            }
          };

          // set default auth header for http requests
          $http.defaults.headers.common['x-userid'] = username; //data.user.name
          $http.defaults.headers.common.Authorization = 'Bearer ' + data.access_token;
          // store user details in globals cookie that keeps user logged in for 1 week (or until they logout)
          var cookieExp = new Date();
          cookieExp.setDate(cookieExp.getDate() + 7);
          $cookies.putObject('globals', $rootScope.globals, {
            expires: cookieExp
          });
        },

        clearCredentials: function() {
          $rootScope.globals = {};
          $cookies.remove('globals');
          $http.defaults.headers.common['x-userid'] = undefined;
          $http.defaults.headers.common.Authorization = undefined;
        }
      };
    }];
});
