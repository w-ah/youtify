// 3rd party includes
const { parentPort, workerData } = require("worker_threads");

// includes
const config = require('./config_loader');
const task = require('./youtify_task');

// Load config
// NOTE: Need to do this again since we don't
config.load();

(async () => 
{
    const data = workerData;
    const { channel } = data;

    try 
    {
        await task.run({ channel });
        parentPort.postMessage({ status: "OK" });
    }
    catch(e)
    {
        parentPort.postMessage({ err: e, status: "ERR" });
    }
})();