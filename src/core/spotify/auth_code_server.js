// 3rd party includes
const https = require('https');
const store = require('../store');

// includes
const spotm = require('./manager');

// Create HTTP server to get the access code from re-direct
// NOTE: We create a single server instance in the main thread,
// which is re-used by all worker threads.
const SERVER = https.createServer();

const LISTENER_MAP = new Map();

// Count listeners so we can make sure we can start the server 
// when it is needed, and stop it when no longer in use.
let listenerCount = 0;

const addRequestListener = async (listener) => 
{
    // check server has already started, else start listening for new connections.
    if(listenerCount === 0)
    {
        const { port, hostname } = spotm.get_redirect_url();
        await new Promise(resolve => 
        {
           
            SERVER.once('error', (e) => 
            {
                if(store.config.debug)
                {
                    console.log("Spotify auth server error:", e);
                }
                // TODO: Handle any errors so the worker doesn't die.
            })
            SERVER.listen(Number(port), hostname, resolve);
        });
    }

    // register listener
    SERVER.addListener('request', listener);

    ++listenerCount;

    if(store.config.debug)
    {
        console.log("Spotify auth code server listener count:", listenerCount);
    }
}

const removeRequestListener = (listener) => 
{
    --listenerCount;

    SERVER.removeListener('request', listener);

    // check if there are other listeners still using the 
    // server, else close the server and stop accepting new connections.
    if(listenerCount === 0)
    {
        SERVER.close();
    }
}

const addCallbackHandler = async (id, handler) => 
{
    // compose the request listener
    const listener = (req, res) => 
    {
        // Check for auth code
        const { hostname, protocol, port } = spotm.get_redirect_url();
        const url = new URL(`${protocol}//${hostname}:${port}${req.url}`);
        const state = url.searchParams.get('state');

        if(state !== String(id))
        {
            // Don't handle - request is for another handler
            return;
        }

        // Immediately end request
        res.end();

        const auth_code = url.searchParams.get('code');

        handler(auth_code);

        // Automatically remove handler after first exec.
        removeCallbackHandler(handler);
    }

    // Associate the handler and listner
    LISTENER_MAP.set(handler, listener);

    // add the listener
    await addRequestListener(listener);
}

const removeCallbackHandler = (handler) => 
{
    const listener = LISTENER_MAP.get(handler);
    removeRequestListener(listener);
    LISTENER_MAP.delete(handler);

    if(store.config.debug)
    {
        console.log("Spotify auth code server listener count:", listenerCount);
    }
}

module.exports = {
    addCallbackHandler
};