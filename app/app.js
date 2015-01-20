var hue = require('./hue'),
leap = require('leapjs'),
sleep = require('sleep');

var app = {

    defaults: {
        UNAUTHORIZED_USER_MESSAGE: 'unauthorized user',
        LINK_BUTTON_MESSAGE:'link button not pressed',
        hostname: null,
        username: 'wells-api-user',
    },

    lights: null,

    init: function() {
        hue.findBridge(function(hostname) {
            hue.setDevice(hostname, app.defaults.username);
            app.authorizeUser();
        });
    },

    authorizeUser: function() {
        hue.getInfo(function(error, response, body) {
            if (body[0].error && body[0].error.description === app.defaults.UNAUTHORIZED_USER_MESSAGE) {
                console.log('User is not authorized to access this bridge.  Get ready to press the link button.');
                app.connectToBridge();
            } else {
                console.log('User is authorized and lights are connected.  Setting up lights...');
                app.setUpLights();
            }
        });
    },

    connectToBridge: function() {
        hue.registerApp(function(error, response, body) {
            if (error) throw error;
            if (body[0].error && body[0].error.description === app.defaults.LINK_BUTTON_MESSAGE) {
                console.log('Press link button.');
                console.log('Testing connection again in...');
                countDown(10);
                app.connectToBridge();
            } else {
                console.log('Successfully connected to bridge.  Starting LeapMotion controller.');
                app.setUpLights();
            }
        });
    },

    setUpLights: function() {
        hue.getLightState(function(lights) {
            console.log('Found lights:');
            console.log(lights);
            hue.cacheLights(JSON.parse(lights));
            app.startLeapController();
        });
    },

    startLeapController: function() {
        var controller = new leap.Controller(),
        lightSetInterval = null,
        updatingLights = false,
        state = {
            "on": false, // lights on: true/false
            "bri": null, // brightness: 0-255
            "hue": null, // hue: 0-65535
            "sat": 255   // always set to 255 for full color
        };

        hue.updateLights(state);

        console.log('Put your hand over the leapmotion to turn the lights on...');

        // continuous loop from the Leap Motion
        controller.on('frame', function(frame) {

            // if a hand is detected
            if (frame.hands[0]) {

                // get the current hand (x,y) coordinates
                var pos = frame.hands[0].palmPosition;

                // update the next state based on hand position
                state = app.getNextState(pos);

                // if we are not already updating the lights on an interval, set the interval
                if (!updatingLights) {
                    updatingLights = true;
                    lightSetInterval = setInterval(function() {
                        hue.updateLights(state);
                    }, 50);
                }
            } else {
                // if there is no hand present, we can stop updating the lights
                clearInterval(lightSetInterval);
                updatingLights = false;
            }
        });

        controller.connect();
    },

    countDown: function(seconds) {
        if (!seconds) return;
        console.log(seconds);
        sleep.sleep(1);
        countDown(seconds - 1);
    },

    getNextState: function(pos) {
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
};

module.exports = {
    init: app.init
};
