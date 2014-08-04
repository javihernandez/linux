"use strict";

var gsettings = require("../gsettings_bridge.js");
var util = require("util");
var fs = require("fs");

// TODO: Why is this commented out?
/*
var test1 = function () {
    fs.readFile("data/gmag-orig.json", function (error, data) {
        var settings = JSON.parse(data);
        util.puts(JSON.stringify(gsettings.setSettings(settings)));
    });
};
*/

var test2 = function () {
    fs.readFile("data/gmag-test1.json", function (error, data) {
        var settings = JSON.parse(data);
        util.puts(JSON.stringify(gsettings.getSettings(settings)));
    });
};

util.puts("Ok testing...");
util.puts(JSON.stringify(gsettings));
//test1();
test2();
util.puts("Done");