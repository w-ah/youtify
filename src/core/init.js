// 3rd party includes
const fs = require('fs');

// includes
const config = require('./config_service');
const store = require('./shared_store');
const db = require('./db');
const scheduler = require('./task_scheduler');

const { TMP_DIR, DATA_DIR } = require('./constants');

const init = async () => 
{
    // Load config
    config.load();

    if(store.config.debug)
    {
        console.log("Using config: \n", JSON.stringify(store.config, null, 4));
    }

    // Cleanup
    console.log("Cleaning up old temporary files...");
    if(fs.existsSync(TMP_DIR))
    {
        fs.rmSync(TMP_DIR, { recursive: true });
    }

    // Init data dirs
    fs.mkdirSync(TMP_DIR, { recursive: true });
    fs.mkdirSync(DATA_DIR, { recursive: true });

    // Init db
    console.log("Initialising DB...");
    await db.init();

    // Add tasks to queue
    console.log("Initialising task scheduler tasks...");
    const { channels } = store.config;
    for(const channel of channels)
    {
        // NOTE: exec_at: 0 ensures the task is queued immediately on startup
        // TODO: interval time
        scheduler.add({ channel, exec_at: 0, interval: 60 * 1000 });
    }

    // Start task scheduler
    // NOTE: Will only terminate on SIGKILL for now
    console.log("Starting task scheduler...");
    await scheduler.run();
}

module.exports = init;