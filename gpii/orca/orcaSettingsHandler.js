/**
 * GPII Orca Settings Handler
 *
 * Copyright 2013 Emergya
 * Author Javier Hernández <jhernandez@emergya.com>
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this License.
 *
 * You may obtain a copy of the License at
 * https://github.com/gpii/universal/LICENSE.txt
 */

(function () {
    "use strict";

    var fluid = require("universal");
    var gpii = fluid.registerNamespace("gpii");
    var spawn = require("child_process").spawn;
    var fs = require("fs");
    var path = require("path");

    // Workaround to load orca's user-settings.conf file according to
    // comments on https://github.com/joyent/node/issues/6073
    //
    require.extensions[".conf"] = require.extensions[".json"];

    var ORCA_ARGS = ["--disable", "speech",
                     "--disable", "braille",
                     "--disable", "braille-monitor",
                     "--disable", "main-window",
                     "--disable", "splash-window"];

    var HOME = process.env.HOME;
    var XDG_DATA_HOME = process.env.XDG_DATA_HOME || path.resolve(HOME, ".local/share");
    var orcaSettingsFile = path.resolve(XDG_DATA_HOME, "orca/user-settings.conf");

    // When Orca is referencing a profile in a setting, it uses an array
    // containing the profile's name and id.
    // ie: startingProfile: ["Default", "default"]
    //
    // But profiles are stored in the 'profiles' section as an object,
    // which main key equals to the profile's id. As we need to retrieve a
    // specific profile under 'profiles' section, we need to get the second
    // value (the id) from the array.
    // 
    var PROFILE_ID = 1;

    fluid.registerNamespace("gpii.launch");
    fluid.registerNamespace("gpii.orca");

    // TODO: Remove this method and all the blocking stuff.
    // (see https://github.com/GPII/linux/pull/16)
    //
    // This setting handler has to be converted to an asynchronous as soon as
    // the lifecycle manager can handle asynchronous actions.
    //
    // The reason for this blocking code is because we need a mechanism to know
    // when the Orca's settings file has been created.
    //
    // The blocking "while loop" is where this method is used and is a big
    // stability risk to the system, since it blocks the node event loop
    // possibly indefinitely.
    //
    // Once we can make this setting handler to be asynchronous, we can use
    // fs.watch or any other similar asynchronous approaches to know
    // when the orca settings file is being created.
    //
    function wait(millis) {
        var date = new Date();
        var curDate;

        do { curDate = new Date(); }
        while (curDate-date < millis);
    }

    function applySettings(app) {
        var settings = app["org.gnome.orca"][0].settings;
        var options = app["org.gnome.orca"][0].options;
        var user = options.user;

        var userSettings = require(orcaSettingsFile);
        var defaultProfiles = fluid.copy(userSettings.profiles);
        var defaultStartingProfile = fluid.copy(userSettings.general.startingProfile);
        var customizedProfile = fluid.copy(userSettings.general);

        if ("profiles" in settings) {
            userSettings.profiles = settings.profiles;
            userSettings.general.startingProfile = settings["general.startingProfile"];
        } else {
            fluid.log("orcaSettingsHandler: User ", user,
                      " has requested these following settings: ", settings);

            for (var k in settings) {
                fluid.set(customizedProfile, k, settings[k], fluid.model.escapedSetConfig);
            }

            customizedProfile.profile = customizedProfile.activeProfile =
                                        customizedProfile.startingProfile =
                                        [user, user];

            userSettings.profiles[user] = customizedProfile;
            userSettings.general.startingProfile = [user, user];
        }

        fs.writeFileSync(orcaSettingsFile,
                         JSON.stringify(userSettings, null, 4));

        var newSettingsResponse = {
            "profiles": {
                "oldValue": defaultProfiles,
                "newValue": userSettings.profiles
            },
            "general.startingProfile": {
                "oldValue": defaultStartingProfile,
                "newValue": [user, user]
            }
        };

        return { "settings": newSettingsResponse};
    }

    gpii.orca.get = function (payload) {
        var app = fluid.copy(payload);

        var settings = fluid.get(app, "data.0.settings");

        var newSettingsResponse = {};
        var userRequestedSettings = settings;
        var userSettings = require(orcaSettingsFile);
        var currentSettings = userSettings.profiles[userSettings.general.startingProfile[PROFILE_ID]];

        fluid.each(userRequestedSettings, function (settingVal, settingKey) {
            var value = fluid.get(currentSettings, settingKey,
                fluid.model.escapedGetConfig);
            newSettingsResponse[settingKey] = value;
        });

        var noOptions = {settings: newSettingsResponse};
        app.data[0] = noOptions;

        return app;
    };

    gpii.orca.set = function (profile) {
        var returnObj = fluid.copy(profile);

        var exists = fs.existsSync(orcaSettingsFile);
        if (!exists) {
            var orcaSpawn = spawn("orca", ORCA_ARGS);
            var pass = 0;
            var maxPass = 10;
            var err;

            while (!fs.existsSync(orcaSettingsFile)) {
                if (pass === maxPass) {
                    err = "Time limit exceeded [" + maxPass*500 +
                          "ms] for creating Orca's configuration file";
                    break;
                }
                wait(500);
                pass++;
            }

            orcaSpawn.kill("SIGKILL");
            if (err) {
                fluid.fail(err);
                fluid.log(err);
                return;
            }
        }

        var returnValue = applySettings(profile);
        fluid.set(returnObj, ["org.gnome.orca", 0], returnValue);

        return returnObj;
    };

})();