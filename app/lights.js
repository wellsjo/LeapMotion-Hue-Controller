var hue = require('node-hue-api');

// my hue credentials for my room
var hostname = '192.168.0.2',
    username = 'newdeveloper';

// connect to the hue lights
var api = new hue.HueApi(hostname, username);

// use for access control to the lights, as they do not support more than one request at a time
var locked = false;

module.exports = {
    // only expose a function to update the lights for now
    setLightState: function(state) {

        // do not update the lights if they are locked/being updated
        if (locked) return;

        // lock the lights while they are being updated
        locked = true;

        // asynchronously update the lights based on the state passed in
        api.setLightState(1, state, function() {
            // unlock the lights after they have been set
            locked = false;
        });
    }
};
