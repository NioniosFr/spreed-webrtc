"use strict";

define(['sjcl'], function(sjcl) {
  return ['$http', 'mediaStream', 'userSettingsData', 'appData',
    function($http,mediaStream, userSettingsData, appData) {

      var createSuseridLocal = function(key, userid) {
        var k = sjcl.codec.utf8String.toBits(key);
        var foo = new sjcl.misc.hmac(k, sjcl.hash.sha256);
        var expiration = parseInt(((new Date()).getTime() / 1000) + 3600, 10);
        var useridCombo = "" + expiration + ":" + userid;
        var secret = foo.mac(useridCombo);
        var data = {
          useridcombo: useridCombo,
          secret: sjcl.codec.base64.fromBits(secret),
        };
        return data;
      };

      var authorize = function(login, settings_callback) {
        mediaStream.users.authorize(login, function(data) {
          console.info("Retrieved nonce - authenticating as user:", data.userid);
          mediaStream.api.requestAuthentication(data.userid, data.nonce);
          appData.e.on("selfReceived", function(event, data) {
            appData.e.triggerHandler("authenticationChanged", [data.Userid, data.Suserid]);
            appData.e.triggerHandler("user", [data.Userid, data.Suserid]);
            var user = login;
            user.displayName = data.Userid;
            mediaStream.users.store(user);
            userSettingsData.save(user);
            settings_callback();
          });
          delete data.nonce;
        }, function(data, status) {
          console.error("Failed to authorize session", status, data);
          mediaStream.users.forget();
        });
      };

      // authentication
      return {
        setCredentials: function(username, password, data, settings_callback) {
          var mediaUser = createSuseridLocal('some-secret-do-not-keep', username);
          authorize(mediaUser, settings_callback);

          // set default auth header for http requests
          $http.defaults.headers.common['x-userid'] = username; //data.user.name
          $http.defaults.headers.common.Authorization = 'Bearer ' + data.access_token;
        },

        clearCredentials: function() {
          $http.defaults.headers.common['x-userid'] = undefined;
          $http.defaults.headers.common.Authorization = undefined;
          mediaStream.users.forget();
          userSettingsData.clear();
        }
      };
    }];
});
