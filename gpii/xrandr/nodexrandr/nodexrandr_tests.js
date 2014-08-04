/*
GPII Xrandr Bridge Tests

Copyright 2013 Emergya

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://github.com/gpii/universal/LICENSE.txt
*/

"use strict";

var fluid = require("universal"),
    jqUnit = fluid.require("jqUnit"),
    xrandr = require("./build/Release/nodexrandr.node");

jqUnit.module("GPII Xrandr Module");

jqUnit.test("Running tests for Xrandr Bridge", function () {
    jqUnit.expect(12);

    // Check if all required methods are available through the Xrandr Bridge
    //
    var methods = ["getBrightness", "setBrightness",
               "getDisplays", "setScreenResolution"];

    for (var method in methods) {
        jqUnit.assertTrue("Checking availability of method '" + method + "'",
                          (methods[method] in xrandr));
    }

    var brightness = xrandr.getBrightness().value;

    // Check getBrightness and setBrightness methods
    //
    jqUnit.assertTrue("Checking that 'setBrightness' method is callable",
                      xrandr.setBrightness(1));

    jqUnit.assertTrue("'getBrightness' is callable",
                      xrandr.getBrightness());

    jqUnit.assertDeepEq("'getBrightness' returns a expected value" +
                        " and 'setBrightness' worked as expected",
                        xrandr.getBrightness().value, 1);

    // Restore brightness to its previous value
    //
    xrandr.setBrightness(brightness);
 
    jqUnit.assertDeepEq("Brightness is restored to its previous value",
                        xrandr.getBrightness().value, brightness);

    // Check getDisplays and setScreenResolution methods
    //
    jqUnit.assertTrue("Checking that 'getDisplays' method is callable",
                      xrandr.getDisplays());

    var resolution = xrandr.getDisplays()[0].resolution;

    jqUnit.assertTrue("Checking that 'setScreenSize' is callable",
                      xrandr.setScreenResolution(800, 600));

    jqUnit.assertDeepEq("Checking that 'setScreenSize' sets the resolution",
                        xrandr.getDisplays()[0].resolution,
                        {width: 800, height: 600, mwidth: resolution.mwidth,
                         mheight: resolution.mheight});

    xrandr.setScreenResolution(resolution.width, resolution.height);
    jqUnit.assertDeepEq("Checking that 'setScreenSize' sets the resolution",
                        xrandr.getDisplays()[0].resolution,
                        resolution);

});