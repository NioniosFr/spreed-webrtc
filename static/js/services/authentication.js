"use strict";

define(['sjcl', 'jwt_decode'], function (sjcl, jwt_decode) {
  return ['$http', 'mediaStream', 'userSettingsData', 'appData',
    function ($http, mediaStream, userSettingsData, appData) {

      var createSuseridLocal = function (key, userid, profile, access_token, id_token) {
        var k = sjcl.codec.utf8String.toBits(key);
        var foo = new sjcl.misc.hmac(k, sjcl.hash.sha256);
        var expiration = parseInt(((new Date()).getTime() / 1000) + 3600, 10);
        var useridCombo = "" + expiration + ":" + userid;
        var secret = foo.mac(useridCombo);

        var tokensHash = {};
        tokensHash["access_token"] = access_token;
        tokensHash["id_token"] = id_token;

        var user = {
          useridcombo: useridCombo,
          secret: sjcl.codec.base64.fromBits(secret),
          profile: profile,
          tokens: tokensHash
        };
        return user;
      };

      var authorize = function (user, settings_callback) {
        mediaStream.users.authorize(user, function (data) {
          console.info("Retrieved nonce - authenticating as user:", data.userid);

          mediaStream.api.requestAuthentication(data.userid, data.nonce, user.tokens);

          appData.e.on("selfReceived", function (event, data) {
            appData.e.triggerHandler("authenticationChanged", [data.Userid, data.Suserid]);
            appData.e.triggerHandler("user", [data.Userid, data.Suserid]);

            user.displayName = user.profile.name;
            user.buddyPicture = user.profile.Picture;

            mediaStream.users.store(user);
            userSettingsData.save(user);

            settings_callback();
          });
          delete data.nonce;
        }, function (data, status) {
          console.error("Failed to authorize session", status, data);
          mediaStream.users.forget();
        });
      };

      // authentication
      return {
        setCredentials: function (username, data, settings_callback) {
          var profile = jwt_decode(data.id_token);

          var mediaUser = createSuseridLocal('some-secret-do-not-keep', username, profile, data.access_token, data.id_token);
          authorize(mediaUser, settings_callback);
        },

        clearCredentials: function () {
          userSettingsData.clear();
          mediaStream.users.forget();
        }
      };
    }
  ];
});
