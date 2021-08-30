// 3rd party includes
const { parentPort, workerData } = require("worker_threads");

// includes
const task = require('./youtify_task');

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