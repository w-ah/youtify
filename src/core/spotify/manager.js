// 3rd party includes
const Spotify = require('spotify-web-api-node');

// includes
const store = require('../store');

const STATE = {
    // NOTE: What if the port becomes un-available before starting the http server?
    credentials: {
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        redirectUri: store.config.redirectUri
    },
    api: new Spotify(),
    // The code that's returned as a query parameter to the redirect URI
    auth_code: '',
    init: false
};

const init_guard = () => 
{
    if(STATE.init)
    {
        return;
    }

    STATE.credentials.redirectUri = store.config.redirectUri;
    STATE.api = new Spotify(STATE.credentials);
    STATE.init = true;
}

const get_api = () => 
{
    return STATE.api;
}

const get_redirect_url = () => 
{
    return new URL(STATE.credentials.redirectUri);
}

const set_auth_code = (auth_code) => 
{
    STATE.auth_code = auth_code;
}

const get_auth_code = () => 
{
    return STATE.auth_code;
}

module.exports = {
    init_guard,
    get_api,
    get_redirect_url,
    set_auth_code,
    get_auth_code
};