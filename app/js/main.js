var leap = require('leapjs'),
sleep = require('sleep'),
gui = require('nw.gui');

$(document).ready(function() {
    app.init();
});

var app = (function(){

    var UNAUTHORIZED_USER_MESSAGE = 'unauthorized user',
    LINK_BUTTON_MESSAGE = 'link button not pressed',
    hostname = '192.168.1.2',
    username = 'wells-api-user';

    var state = {
        "on": false, // lights on: true/false
        "bri": null, // brightness: 0-255
        "hue": null, // hue: 0-65535
        "sat": 255   // always set to 255 for full color
    };

    var lights = null;

    var init = function() {
        hue.findBridge(function(bridge) {
            console.log(bridge);
            hue.setDevice(hostname, username);
            authorizeUser();
        });
    };

    var show = function(message) {
        console.log(message);
        $('#message_box').text(message);
        setTimeout(function(){
            $('#message_box').text('');
        }, 5000);
    }

    function authorizeUser() {
        hue.getInfo(function(error, response, body) {
            if (body[0].error && body[0].error.description === UNAUTHORIZED_USER_MESSAGE) {
                show('User is not authorized to access this bridge.  Get ready to press the link button.');
                connectToBridge();
            } else {
                show('User is authorized and lights are connected.  Setting up lights...');
                setUpLights();
            }
        });
    }

    function connectToBridge() {
        hue.registerApp(function(error, response, body) {
            if (error) throw error;
            if (body[0].error && body[0].error.description === LINK_BUTTON_MESSAGE) {
                show('Press link button.');
                show('Testing connection again in...');
                countDown(10);
                connectToBridge();
            } else {
                show('Successfully connected to bridge.  Starting LeapMotion controller.');
                setUpLights();
            }
        });
    }

    function setUpLights() {
        hue.getLightState(function(lights) {
            show('Found lights:');
            show(lights);
            hue.cacheLights(JSON.parse(lights));
            startLeapController();
        });
    }

    function startLeapController() {
        var controller = new leap.Controller(),
        lightSetInterval = null,
        updatingLights = false;

        hue.updateLights(state);

        show('Put your hand over the leapmotion to turn the lights on...');

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
    }

    function countDown(seconds) {
        if (!seconds) return;
        show(seconds);
        sleep.sleep(1);
        countDown(seconds - 1);
    }

    function getNextState(pos) {
        var state = {
            sat: 255
        },
        x = pos[0],
        y = pos[1];

        // calculate hue (color) based on hand x coordinate
        var temp = Math.floor((13107/124)*(x) + (1900515/62));


        // calculate brightness based on hand y coordinate
        var brightness = Math.floor(y / 2);
        if (brightness > 255) brightness = 255;
        state.bri = brightness;

        // turn off the light if below the brightness threshold
        if (brightness < 80) {
            state.on = false;
        } else (){
            state.on = true;
        }

        return state;
    }

    function setBackgroundColor(color) {
        $('body').css('background-color', color);
    }

    return {
        init: init,
        show: show
    }
}());
