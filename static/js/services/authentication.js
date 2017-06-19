"use strict";

define(['sjcl'], function(sjcl) {
  return ['$http', '$rootScope', 'mediaStream',
    function($http, $rootScope, mediaStream) {
      var lastNonce = null;
			var lastUserid = null;
			var lastData = null;

      var createSuseridLocal = function(key, userid) {
        var k = sjcl.codec.utf8String.toBits(key);
        var foo = new sjcl.misc.hmac(k, sjcl.hash.sha256);
        var expiration = parseInt(((new Date()).getTime()/1000)+3600, 10);
        var useridCombo = ""+expiration+":"+userid;
        var secret = foo.mac(useridCombo);
        var data = {
          useridcombo: useridCombo,
          secret: sjcl.codec.base64.fromBits(secret)
        };
        lastData = data;
        return data;
      };

      var authorize = function(authData) {
        console.log("Testing authorize with data", authData);
        mediaStream.users.authorize(authData, function(data) {
          mediaStream.api.requestAuthentication(lastUserid, lastNonce);
          lastNonce = data.nonce;
          lastUserid = data.userid;
          console.log("Retrieved nonce", lastNonce, lastUserid);
        }, function() {
          console.log("Authorize error", arguments);
        });
      };

      var lastAuthenticate = function() {
        if (!lastNonce || !lastUserid) {
          console.log("Run testAuthorize first.");
          return false;
        }

      };

      // authentication
      return {
        setCredentials: function(username, password, data) {
          //var authdata = $base64.encode(username + ':' + password);
          var mediaUser = createSuseridLocal('some-secret-do-not-keep', username);

          mediaStream.users.authorize(mediaUser, function(data){
            mediaStream.api.requestAuthentication(data.userid, data.nonce);
            mediaStream.users.store(mediaUser);
          }, function(data){
              console.log("Authorize error", data);
          }
        );

          // set default auth header for http requests
          $http.defaults.headers.common['x-userid'] = username; //data.user.name
          $http.defaults.headers.common.Authorization = 'Bearer ' + data.access_token;

          // TODO: Store credentials into mediaStream.user

          // store user details in globals cookie that keeps user logged in for 1 week (or until they logout)
          // var cookieExp = new Date();
          // cookieExp.setDate(cookieExp.getDate() + 7);
          // $cookies.putObject('globals', $rootScope.globals, {
          //   expires: cookieExp
          // });
        },

        clearCredentials: function() {
          $http.defaults.headers.common['x-userid'] = undefined;
          $http.defaults.headers.common.Authorization = undefined;
          mediaStream.users.forget();
        }
      };
    }];
});
