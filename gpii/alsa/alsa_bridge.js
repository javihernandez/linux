/*!
GPII Node.js ALSA Volume Bridge

Copyright 2013 Emergya

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://github.com/gpii/universal/LICENSE.txt
*/

(function () {
    "use strict";

    var fluid = require("universal");
    var gpii = fluid.registerNamespace("gpii");
    var alsa = require("./nodealsa/build/Release/nodealsa.node");

    fluid.registerNamespace("gpii.alsa");

    fluid.defaults("gpii.alsa.getSystemVolume", {
        gradeNames: "fluid.function",
        argumentMap: {
        }
    });

    fluid.defaults("gpii.alsa.setSystemVolume", {
        gradeNames: "fluid.function",
        argumentMap: {
            value: 0
        }
    });

    fluid.defaults("gpii.alsa.get", {
        gradeNames: "fluid.function",
        argumentMap: {
            payload: 0
        }
    });

    fluid.defaults("gpii.alsa.set", {
        gradeNames: "fluid.function",
        argumentMap: {
            payload: 0
        }
    });

    gpii.alsa.getSystemVolume = function(){
        return alsa.getSystemVolume();
    };

    gpii.alsa.setSystemVolume = function(value){
        return alsa.setSystemVolume(value);
    };

    gpii.alsa.get = function (payload){
        var app = fluid.copy(payload);

        var newSettingsResponse = {masterVolume: gpii.alsa.getSystemVolume()};
        var noOptions = {settings: newSettingsResponse};
        app.data[0] = noOptions;

        return app;
    };

    gpii.alsa.set = function (payload){
        var app = fluid.copy(payload);
        var settings = app["org.alsa-project"][0].settings;

        var oldValue = alsa.getSystemVolume();
        alsa.setSystemVolume(settings.masterVolume);

        var newSettingsResponse = {};
        newSettingsResponse.masterVolume = {
            "oldValue": oldValue,
            "newValue": settings.masterVolume
        };

        var noOptions = {settings: newSettingsResponse};
        fluid.set(app, ["org.alsa-project", 0], noOptions);

        return app;
    };

})();