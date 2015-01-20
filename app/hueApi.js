var request = require('request');

module.exports = {

    hostname: null,
    username: null,
    lights: null,

    setDevice: function(hostname, username) {
        this.hostname = hostname;
        this.username = username;
    },

    cacheLightIds: function(lights) {
        this.lights = lights;
    },

    getInfo: function(callback) {
        var url = 'http://' + this.hostname + '/api/' + this.username;
        request({url: url}, function(error, response, body) {
            callback(error, response, body);
        });
    },

    registerUser: function(callback) {
        var url = 'http://' + this.hostname + '/api';
        request({
            url: url,
            method: 'POST',
            json: true,
            body: {
                devicetype: "api user",
                username: this.username
            },
            timeout: 5000
        }, callback);
    },

    getLightState: function(callback) {
        var url = 'http://' + this.hostname + '/api/' + this.username + '/lights';
        request({url: url}, function(error, response, body) {
            if (error) throw error;
            callback(body);
        });
    },

    lock: false,

    updateLights: function(state) {

        // do not update the lights if they are locked/being updated
        if (this.lock) return;

        // lock the lights while they are being updated
        this.lock = true;

        // lol, javascript
        var that = this;

        // loop through the lights and set them individually
        for (var i = 0; i < this.lights.length; i++) {
            this.setLight(this.lights[i], state, function() {
                // on the last iteration, release the lock so the lights can be updated again
                if (i === that.lights.length) {
                    that.lock = false;
                }
            });
        }
    },

    setLight: function(lightId, state, callback) {
        var url = 'http://' + this.hostname + '/api/' + this.username + '/lights/' + lightId + '/state';
        request({
            url: url,
            method: 'PUT',
            json: true,
            body: state
        }, function() {
            callback();
        });
    },

    createRequest: function(endpoint, type, body, callback) {

        var url = 'http://' + this.hostname + '/api/' + endpoint;

        if (type === 'GET') {
            request(url, function(error, response, body) {
                callback(error, response, body);
            });
        }

        if (type === 'PUT') {
            request.put(url, body, function(error, response, body) {
                callback(error, response, body);
            });
        }
    }
};
