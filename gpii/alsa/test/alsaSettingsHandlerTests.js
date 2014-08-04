/*
GPII Node.js ALSA Volume Bridge

Copyright 2013 Emergya

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://github.com/gpii/universal/LICENSE.txt
*/

"use strict";

var fluid = require("universal"),
    jqUnit = fluid.require("jqUnit");

require("alsa");
var alsa = fluid.registerNamespace("gpii.alsa");

jqUnit.module("GPII Node.js ALSA Volume Bridge");

jqUnit.test("Running tests for ALSA Settings Handler", function () {
    jqUnit.expect(6);

    // Check if all required methods are available through the
    // ALSA Settings Handler.
    //
    var methods = ["getSystemVolume", "setSystemVolume", "get", "set"];
    for (var method in methods) {
        jqUnit.assertTrue("Checking availability of method '" + method + "'",
                          (methods[method] in alsa));
    }

    var payload = {
        "org.alsa-project": [{
            settings: {
                "masterVolume": 1
            }
        }]
    };

    var returnPayload = alsa.set(payload);

    jqUnit.assertDeepEq("The system volume is being setted well",
            returnPayload["org.alsa-project"][0].settings.masterVolume.newValue,
            payload["org.alsa-project"][0].settings.masterVolume);

    var newPayload = fluid.copy(payload);
    newPayload["org.alsa-project"][0].settingsmasterVolume =
        returnPayload["org.alsa-project"][0].settingsmasterVolume.oldValue;

    var lastPayload = alsa.set(newPayload);

    jqUnit.assertDeepEq("The system volume is being restored well",
            returnPayload["org.alsa-project"][0].settings.masterVolume.oldValue,
            lastPayload["org.alsa-project"][0].settings.masterVolume.newValue);
});