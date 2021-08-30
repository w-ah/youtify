const os = require('os');

const store = {
    config: {
        debug: false,
        headless: true,
        execMode: "async",
        workers: os.cpus().length,
        redirectUri: "http://localhost:8080/callback",
        updateSize: 30,
        updateIntervalHours: 6,
        channels: []
    }
};

module.exports = store;