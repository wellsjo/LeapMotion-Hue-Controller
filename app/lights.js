// node hue api https://github.com/peter-murray/node-hue-api
var hue = require('node-hue-api'),
timeout = 3000;

// my hue credentials for my room
// TODO look up in a static file whether there is already a user/ip adress to work with
var app = {};
var hostname = null,
username = 'leapmotion-hue-controller-user',
userDescription = 'LeapMotion Hue Controller User',
locked = null,
api = null;
app.config = null;

if (!hostname) {
    findLightBridgeHost(function(hostname) {
        api = new hue.HueApi(hostname, username);
        api.connect(function(err, config) {
            console.log(config);
            app.config = config
            console.log('press link button');
            api.registerUser(hostname, null, userDescription).then(function(result) {
                console.log(result);
            }).fail().done();
        });

        // api.registerUser(host, null, userDescription).then(function(result) {
        //     console.log(result);
        // }).done();

        // api.createUser(host, null, null, function(err, user) {
        //     console.log(err);
        //     console.log(user);
        //     if (err) throw err;
        //     username = user;
        //     init();
        // })
    });
}

function findLightBridgeHost(callback) {
    hue.locateBridges().then(function(bridge) {
        if (bridge[0]) {
            hostname = bridge[0].ipaddress;
            callback(hostname);
        } else {
            // fallback on searchForBridges
            hue.searchForBridges(timeout).then(function(bridge) {
                if (bridge[0]) {
                    hostname = bridge[0].id;
                    callback(hostname);
                } else {
                    callback(false);
                }
            }).done();
        }
    }).done();
}

function init() {
    console.log('init');
    // connect to the hue lights
    if (!api) api = new hue.HueApi(hostname, username);

    // use for access control to the lights, as they do not support more than one request at a time
    locked = false;
}



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
        api.setLightState(2, state, function() {
            // unlock the lights after they have been set
            locked = false;
        });
    },

    areReady: function() {
        return !!api;
    }
};
