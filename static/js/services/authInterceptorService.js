"use strict";
define([], function() {

  return ['globalContext', '$injector', function(globalContext, $injector) {

    return {
      request: function(config) {
        var userSettingsData = $injector.get('userSettingsData');
        var storedUser = userSettingsData.load();

        if(!storedUser){
          return config;
        }

        config.headers = config.headers || {};
        if(storedUser.tokens && storedUser.tokens.access_token){
          config.headers.Authorzation = 'Bearer '+ storedUser.tokens.access_token;
        }

        return config;
      }
    }
  }];
});
