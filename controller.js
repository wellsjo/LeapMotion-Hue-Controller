var lights = require('./lights');
var leap = require('leapjs');
var controller = new leap.Controller();

// hue: 0-65535
// sat: 0-255
// bri: 0-255
var state = {
    'on': false,
    'bri': null,
    'hue': null,
    'sat': 255
};

var lightSetInterval;
var updatingLights = false;

controller.on('frame', function(frame) {

    // if a hand comes into range
    if (frame.hands[0]) {
        var pos = frame.hands[0].palmPosition;

        // update the next state based on hand position
        setLightState(pos);

        // if we are not already updating the lights on an interval, set the interval
        if (!updatingLights) {
            updatingLights = true;
            lightSetInterval = setInterval(function() {
                lights.state(function(state){
                    console.log(state);
                })
            }, 200);
        }
    } else {
        clearInterval(lightSetInterval);
        updatingLights = false;
    }
});

function setLightState(pos) {
    var x = pos[0];
    var y = pos[1];

    // hue
    state.hue = Math.floor((13107/124)*(x) + (1900515/62));

    // brightness
    var brightness = Math.floor(y / 2);
    if (brightness > 255) brightness = 255;
    if (brightness < 0) brightness = 0;
    state.bri = brightness;

    if (brightness < 70) {
        state.on = false;
    } else {
        state.on = true
    }
}

controller.connect();
