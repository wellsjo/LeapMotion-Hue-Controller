var lights = require('./lights'),
leap = require('leapjs');

var controller = new leap.Controller();
var lightSetInterval;
var updatingLights = false;

// this variable represents the current state the lights should be in based on the hand position.
// NOTE: this will not always be the actual current state of the lights since they update asynchronously
var state = {
    'on': false, // lights on: true/false
    'bri': null, // brightness: 0-255
    'hue': null, // hue: 0-65535
    'sat': 255   // always set to 255 for full color
};

// continuous loop from the Leap Motion
controller.on('frame', function(frame) {

    // if a hand is detected
    if (frame.hands[0] && lights.areReady()) {

        // get the current hand (x,y) coordinates
        var pos = frame.hands[0].palmPosition;

        // update the next state based on hand position
        updateState(pos);

        // if we are not already updating the lights on an interval, set the interval
        if (!updatingLights) {
            updatingLights = true;
            lightSetInterval = setInterval(function() {
                lights.setLightState(state);
            }, 50);
        }
    } else {
        // if there is no hand present, we can stop updating the lights
        clearInterval(lightSetInterval);
        updatingLights = false;
    }
});

// update the light state (on/off, brightness, color) based on the hand position
function updateState(pos) {
    var x = pos[0];
    var y = pos[1];

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
}

controller.connect();
