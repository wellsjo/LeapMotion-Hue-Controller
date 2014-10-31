var hue = require('node-hue-api');

var hostname = '192.168.0.2',
username = 'newdeveloper';

// connect to the hue lights
var api = new hue.HueApi(hostname, username);
api.getFullState(function(err, config) {
    displayResult(config.lights);
});

var state = {
    'on': true,
    'bri': 254,
    'hue': 50404,
    'sat': 253
};

api.setLightState(1, state, function(err, result) {
    if (err) throw err;
    displayResult(result);
});

// Display functions
var displayBridges = function(bridge) {
    console.log("Hue Bridges Found: " + JSON.stringify(bridge));
};

var displayResult = function(result) {
    console.log("here");
    console.log(JSON.stringify(result, null, 2));
};

var displayUserResult = function(result) {
    console.log("Created user: " + JSON.stringify(result));
};

var displayError = function(err) {
    console.log("Error: " + err);
};
