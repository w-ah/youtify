const timeoutFn = (fn, timeout) => 
{
    return async (...args) => 
    {
        let timer = setTimeout(() => 
        {
            throw new Error('TIMEOUT');
        }, timeout);
        await fn(...args);
        clearTimeout(timer);
    }
}

module.exports = timeoutFn;