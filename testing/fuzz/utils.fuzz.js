// includes
const wait = require('./../../src/core/utils/wait');

async function fuzz(bytes)
{
    const ms = Math.min(Math.max(Number(bytes), 0), 100);
    try 
    {
        await Promise.all([
            wait.wait_hr(ms / (60 * 60 * 1000)),
            wait.wait_min(ms / (60 * 1000)),
            wait.wait_s(ms / 1000),
            wait.wait_ms(ms)
        ]);
    }
    catch(error)
    {
        if(!acceptable(error)) throw error;
    }
}

const acceptable = (error) => 
{
    return false;
}

module.exports = { fuzz };