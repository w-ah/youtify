const run_for_fn = require('./run_for');

const retryFn = (fn, options) => 
{
    return async (...args) => 
    {
        const mergedOptions = { timeout: 30 * 1000, maxRetries: 3, ...options };

        {
            const { timeout, maxRetries } = mergedOptions;

            let retries = 0;

            while(retries < maxRetries)
            {
                try 
                {
                    const data = await run_for_fn(fn, timeout)(...args);
                    return data;
                }
                catch(e)
                {
                    console.log(`Retrying call to ${fn.name}`);
                    ++retries;
                }
            }

            // Max retries reached, throw error
            throw new Error('MAXRETRIES');
        }
    };
}

module.exports = retryFn;