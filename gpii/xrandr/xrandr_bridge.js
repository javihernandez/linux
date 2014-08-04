/*!
GPII Node.js Xrandr Bridge

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
    var xrandr = require("./nodexrandr/build/Release/nodexrandr.node");

    fluid.registerNamespace("gpii.xrandr");

    fluid.defaults("gpii.xrandr.getBrightness", {
        gradeNames: "fluid.function",
        argumentMap: {
        }
    });

    fluid.defaults("gpii.xrandr.getScreenResolution", {
        gradeNames: "fluid.function",
        argumentMap: {
        }
    });

    fluid.defaults("gpii.xrandr.setBrightness", {
        gradeNames: "fluid.function",
        argumentMap: {
            value: 0
        }
    });

    fluid.defaults("gpii.xrandr.setScreenResolution", {
        gradeNames: "fluid.function",
        argumentMap: {
            value: 0
        }
    });

    gpii.xrandr.getBrightness = function () {
        return xrandr.getBrightness().value;
    };

    gpii.xrandr.getScreenResolution = function () {
        var displayInfo = xrandr.getDisplays();
        for (var i=0; i<displayInfo.length; i++) {
            if (displayInfo[i].status === "connected") {
                break;
            }
        }

        return {
            width: displayInfo[i].resolution.width,
            height: displayInfo[i].resolution.height
        };
    };

    gpii.xrandr.setBrightness = function (value) {
        return xrandr.setBrightness(value);
    };

    gpii.xrandr.setScreenResolution = function (value) {
        var current = gpii.xrandr.getScreenResolution();
        if (JSON.stringify(value) === JSON.stringify(current)) {
            return true;
        } else {
            return xrandr.setScreenResolution(value.width, value.height);
        }
    };
    
    gpii.xrandr.allSettings = {
        "screen-brightness": {
            get: "gpii.xrandr.getBrightness",
            set: "gpii.xrandr.setBrightness"
        },
        "screen-resolution": {
            get: "gpii.xrandr.getScreenResolution",
            set: "gpii.xrandr.setScreenResolution"
        }
    };
    
    gpii.xrandr.getImpl = function (settingsRequest) {
        settingsRequest = settingsRequest || gpii.xrandr.allSettings;
        var settings = fluid.transform(settingsRequest, function (key) {
            var funcEntry = gpii.xrandr.allSettings[key];
            if (funcEntry) {
                return fluid.invokeGlobalFunction(funcEntry.set);
            } else {
                fluid.fail("Invalid key to Xrandr settings handler - " +
                    key + " - valid choices are " + JSON.stringify(fluid.keys(gpii.xrandr.allSettings)));
            }
        });
        return settings;
    };

    gpii.xrandr.get = function (settingsarray) {
        var app = fluid.copy(settingsarray);
        for (var appId in app) {
            for (var j = 0; j < app[appId].length; j++) {
                var settings = gpii.xrandr.getImpl(app[appId][j].settings);

                var noOptions = { settings: settings };
                app[appId][j] = noOptions;
            }
        }
        return app;
    };

    gpii.xrandr.set = function (settingsarray) {
        var app = fluid.copy(settingsarray);
        for (var appId in app) {
            for (var j = 0; j < app[appId].length; j++) {
                var settings = app[appId][j].settings;

                for (var settingKey in settings) {
                    var value = settings[settingKey];

                    var oldValue;
                    if (settingKey === "screen-brightness") {
                        oldValue = gpii.xrandr.getBrightness();
                        gpii.xrandr.setBrightness(value);
                    } else if (settingKey === "screen-resolution") {
                        oldValue = gpii.xrandr.getScreenResolution();
                        gpii.xrandr.setScreenResolution(value);
                    } else {
                        var err = "Invalid key: " + settingKey;
                        fluid.fail(err);
                        fluid.log(err);
                    }

                    settings[settingKey] = {
                        "oldValue": oldValue,
                        "newValue": value
                    };
                }
                var noOptions = { settings: settings};
                app[appId][j] = noOptions;
            }
        }
        return app;
    };

})();