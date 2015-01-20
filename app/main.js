var HueApi = require('./hueApi'),
leap = require('leapjs'),
sleep = require('sleep');

var UNAUTHORIZED_USER_MESSAGE = 'unauthorized user';
var LINK_BUTTON_MESSAGE = 'link button not pressed';

var hostname = '192.168.1.6';
var username = 'wells-api-user';
var lights = null;

HueApi.setDevice(hostname, username);

authorizeUser();

function authorizeUser() {
    HueApi.getInfo(function(error, response, body) {
        if (body[0].error && body[0].error.description === UNAUTHORIZED_USER_MESSAGE) {
            log('User is not authorized to access this bridge.  Get ready to press the link button.');
            connectToBridge();
        } else {
            log('User is authorized and lights are connected.  Setting up lights...');
            setupLights();
        }
    });
};

function connectToBridge() {
    HueApi.registerUser(function(error, response, body) {

        if (error) throw error;

        if (body[0].error && body[0].error.description === LINK_BUTTON_MESSAGE) {
            log('Press link button.');
            log('Testing connection again in...');
            countDown(10);
            connectToBridge();
        } else {
            log('Successfully connected to bridge.  Starting LeapMotion controller.');
            setupLights();
        }
    });
}

function setupLights() {
    HueApi.getLightState(function(response) {
        var lights = Object.keys(JSON.parse(response));
        log('Found lights:');
        log(lights);
        HueApi.cacheLightIds(lights);
        startLeapController();
    });
}

function startLeapController() {
    var controller = new leap.Controller(),
    lightSetInterval = null,
    updatingLights = false,
    state = {
        "on": false, // lights on: true/false
        "bri": null, // brightness: 0-255
        "hue": null, // hue: 0-65535
        "sat": 255   // always set to 255 for full color
    };

    HueApi.updateLights(state);

    log('Put your hand over the leapmotion to turn the lights on...');

    // continuous loop from the Leap Motion
    controller.on('frame', function(frame) {

        // if a hand is detected
        if (frame.hands[0]) {

            // get the current hand (x,y) coordinates
            var pos = frame.hands[0].palmPosition;

            // update the next state based on hand position
            state = getNextState(pos);

            // if we are not already updating the lights on an interval, set the interval
            if (!updatingLights) {
                updatingLights = true;
                lightSetInterval = setInterval(function() {
                    HueApi.updateLights(state);
                }, 50);
            }
        } else {
            // if there is no hand present, we can stop updating the lights
            clearInterval(lightSetInterval);
            updatingLights = false;
        }
    });

    controller.connect();
}

function countDown(seconds) {
    if (!seconds) return;
    log(seconds);
    sleep.sleep(1);
    countDown(seconds - 1);
}

function log(message) {
    console.log(message);
}

function getNextState(pos) {
    var state = {
        sat: 255
    },
    x = pos[0],
    y = pos[1];

    // calculate hue (color) based on hand x coordinate
    state.hue = Math.floor((13107/124)*(x) + (1900515/62));

    // calculate brightness based on hand y coordinate
    var brightness = Math.floor(y / 2);
    if (brightness > 255) brightness = 255;
    state.bri = brightness;

    // turn off the light if below the brightness threshold
    if (brightness < 80) {
        state.on = false;
    } else {
        state.on = true
    }

    return state;
}
