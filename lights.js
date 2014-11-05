var hue = require('node-hue-api');

var hostname = '192.168.0.2',
username = 'newdeveloper';

// connect to the hue lights
var api = new hue.HueApi(hostname, username);

module.exports = {
    // TODO make this loop through lights instead of assuming
    setLightState: function(state) {
        api.setLightState(1, state, function(err, result) {
            if (err) throw err;
        });
        api.setLightState(2, state, function(err, result) {
            if (err) throw err;
        });
    },

    // TODO make this loop through lights instead of assuming
    state: function(callback) {
        api.getFullState(function(err, config) {
            callback(config.lights[1].state.on);
        });
    }
};
