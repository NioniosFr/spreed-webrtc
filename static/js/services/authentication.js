"use strict";

define(['sjcl', 'jwt_decode'], function (sjcl, jwt_decode) {
  return ['$http', 'mediaStream', 'globalContext', 'userSettingsData', 'appData',
    function ($http, mediaStream, globalContext, userSettingsData, appData) {

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
            user.buddyPicture = user.profile.buddyPicture;

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

      function GetUserInfo(access_token){
        return $http({
          method: 'GET',
          url: globalContext.Cfg.UserInfoURI + '/iris/api/common/user/info',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Bearer '+access_token
          }
        });
      }

      function debugDenied(data){
        var p ={};
        p.name = "ΥΣΜΙΑΣ (ΑΠΗΥ) ΓΕΑ ΚΜΗ (12345)";
        p.buddyPicture = "";
        p.email ="me@haf.gr";
        p.Profiles=[];
        p.ActiveProfile=0;
        p.Role = [];
        //   {Name:"Name",Value:"Role1"}
        //   ,{Name:"Room", Value:"Role2"}
        // ];
        p.Role.push("Role 1");
        p.Role.push("Role 2");

        p.Room = [];
        p.Room.push("Test Room 1")
        p.Room.push("Test Room 2")
        p.Room.push("Test Room 3")

        return p;
      }

      function CreateUserProfile(data) {
          theProfile = {};
          theProfile.buddyPicture = data.Photo;
          theProfile.name = data.Title;
          theProfile.email = data.Email;
          theProfile.Room = [];
          theProfile.Role = [];

          for (var i=0; i < data.Role.length; i++ ){
            if (data.Roles[i].Name == "Room") {
              theProfile.Room.push(data.Role[i].Value)
            }else{
              theProfile.Role.push(data.Role[i].Value)
            }
          }

          return theProfile;
      }

      function doAuth(username, profile, data, settings_callback){
        var mediaUser = createSuseridLocal('some-secret-do-not-keep', username, profile, data.access_token, data.id_token);
        authorize(mediaUser, settings_callback);
      }

      // authentication
      return {
        setCredentials: function (username, data, settings_callback) {
          var profile = {};
          if (globalContext.Cfg.JwtTokenMode == "base64") {
            var res = GetUserInfo(data.access_token)
            .then(function(httpdata) {
              profile = CreateUserProfile(httpdata);
              var base64Encoded = window.btoa(encodeURIComponent(JSON.stringify(profile)));
              data.id_token = base64Encoded;
              doAuth(username, profile, data, settings_callback);
            }, function(httpdata){
              console.warn("GetUserInfo failed: using debug user details");
              profile = debugDenied(httpdata);
              var base64Encoded = window.btoa(encodeURIComponent(JSON.stringify(profile)));
              data.id_token = base64Encoded;
              doAuth(username, profile, data, settings_callback);
            });
          } else {
            profile = jwt_decode(data.id_token);
            doAuth(username, profile, data, settings_callback);
          }

        },

        clearCredentials: function () {
          userSettingsData.clear();
          mediaStream.users.forget();
        }
      };
    }
  ];
});
