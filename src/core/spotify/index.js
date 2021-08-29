// 3rd party includes
const http = require('http');
const Spotify = require('spotify-web-api-node');
const puppeteer = require('puppeteer');

// includes
const { BROWSER_DATA_DIR } = require('../constants'); 
const store = require('../shared_store');
const { wait_s } = require('../utils/wait');

const LOCAL = {
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

// Create HTTP server to get the access code from re-direct
const server = http.createServer();

const init_guard = () => 
{
    if(LOCAL.init)
    {
        return;
    }

    LOCAL.credentials.redirectUri = store.config.redirectUri;
    LOCAL.api = new Spotify(LOCAL.credentials);
    LOCAL.init = true;
}

const load_auth_code = async () => 
{
    init_guard();

    // Open browser 
    const browser = await puppeteer.launch({ 
        headless: store.config.headless, 
        userDataDir: BROWSER_DATA_DIR, 
        defaultViewport: { 
            width: 1920, 
            height: 1080 
        }  
    }); 

    LOCAL.auth_code = await new Promise(async (resolve, reject) => 
    {
        let closed = false;

        // Listen for auth code callback
        const serverListener = async (req, res) => {
            // Immediately end request
            res.end();
        
            // Check for auth code
            const url = req.url;
            const auth_code = url
                .replace('/callback?code=', '')
                .replace('&state=', '');

            closed = true;
            resolve(auth_code);
        };
        server.addListener('request', serverListener);
        server.listen(new URL(store.config.redirectUri).port);

        const scopes = ['user-read-private', 'user-read-email', 'playlist-modify-private', 'playlist-modify-public'];
        const state = '';

        // Create the authorization URL
        const authorizeURL = LOCAL.api.createAuthorizeURL(scopes, state);

        try 
        {
            // Open browser page and login using provided user/pass
            const page = await browser.newPage();
            await page.goto(authorizeURL);

            console.log(authorizeURL)
            
            console.log("Entering username...");
            await page.focus('input#login-username');
            await page.keyboard.type(process.env.SPOTIFY_USER);

            await wait_s(1);

            console.log("Entering password...");
            await page.focus('input#login-password');
            await page.keyboard.type(process.env.SPOTIFY_PASS);

            await wait_s(1);

            console.log("Logging in...");
            await page.hover('button#login-button');
            await page.click('button#login-button');
            await page.waitForNavigation();

            // Guard against if we have already closed the browser and
            // handled the auth_code in the server request listener.
            if(closed)
            {
                return;
            }

            // if there is a verify/accept/aggree permissions button
            try 
            {  
                console.log("Accepting permissions...");
                if(await page.$('button#auth-accept'))
                {
                    await page.click('button#auth-accept');
                    await page.waitForNavigation();
                    console.log("Finished auth");
                }
            }
            catch(e)
            {
                // Skip
            }
        }
        catch(e)
        {
            if(store.config.debug)
            {
                console.log(e);
            }
        }
    });

    await browser.close();
    await new Promise(resolve => 
    {
        server.removeAllListeners('request');
        server.close(resolve)
    });
}

const refresh_access_token = async () => 
{
    // Retrieve an access token and a refresh token
    const data = await LOCAL.api.authorizationCodeGrant(LOCAL.auth_code);

    const { expires_in, access_token, refresh_token } = data.body;

    if(store.config.debug)
    {
        console.log('The token expires in ' + expires_in);
        console.log('The access token is ' + access_token);
        console.log('The refresh token is ' + refresh_token);
    }

    // Set the access token on the API object to use it in later calls
    LOCAL.api.setAccessToken(access_token);
    LOCAL.api.setRefreshToken(refresh_token);

    await LOCAL.api.refreshAccessToken();
}

const authenticate_user_guard = async () => 
{
    await load_auth_code();
    await refresh_access_token();
}

const search_track = async (query) => 
{
    await authenticate_user_guard();

    const data = await LOCAL.api.searchTracks(query, { limit: 1 });

    return data.body;
}

const create_playlist = async (name) => 
{
    await authenticate_user_guard();

    const data = await LOCAL.api.createPlaylist(name);

    return data.body;
}

const add_to_playlist = async (playlistId, trackUri) => 
{
    await authenticate_user_guard();

    // Check if track already added
    const data = await LOCAL.api.getPlaylistTracks(playlistId);
    const details = data.body;
    const tracks = details.items.map(i => i.track);
    const track = tracks.find(t => t.uri === trackUri);

    if(track)
    {
        // Track already added to playlist, skip
        return;
    }

    // TODO: Add to start vs. end of playlist using { position: 0 } option
    await LOCAL.api.addTracksToPlaylist(playlistId, [ trackUri ], );
}

// NOTE: Will take first in list if multiple playlists with same name.
// Use id if unique names is not guaranteed
const get_playlist_by_name = async (name) => 
{
    await authenticate_user_guard();

    const data = await LOCAL.api.getUserPlaylists();
    const playlists = data.body;

    const playlist = playlists.items.find(p => p.name === name);

    return playlist;
}

const get_or_create_playlist_by_name = async (name) => 
{
    await authenticate_user_guard();

    let data = await LOCAL.api.getUserPlaylists();
    const playlists = data.body;

    const playlist = playlists.items.find(p => p.name === name);

    if(playlist)
    {
        return playlist; 
    }

    // Create playlist
    data = await LOCAL.api.createPlaylist(name);

    return data.body;
}

const get_or_create_playlist_by_id = async (id, name) => 
{
    await authenticate_user_guard();

    let data = await LOCAL.api.getUserPlaylists();
    const playlists = data.body;

    const playlist = playlists.items.find(p => p.id === id);

    if(playlist)
    {
        return playlist; 
    }

    // Create playlist
    data = await LOCAL.api.createPlaylist(name);

    return data.body;
}

module.exports = {
    search_track,
    create_playlist,
    add_to_playlist,
    get_playlist_by_name,
    get_or_create_playlist_by_name,
    get_or_create_playlist_by_id
};
