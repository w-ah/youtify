// 3rd party includes
const http = require('http');
const Spotify = require('spotify-web-api-node');
const puppeteer = require('puppeteer');

// includes
const { BROWSER_DATA_DIR } = require('../constants'); 
const store = require('../shared_store');

// NOTE: What if the port becomes un-available before starting the http server?
const credentials = {
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: 'http://localhost:7777/callback' // NOTE: This must be whitelisted in your developer account spotify app settings
};
const SPOTIFY_API = new Spotify(credentials);

// The code that's returned as a query parameter to the redirect URI
let AUTH_CODE = '';

// Create HTTP server to get the access code from re-direct
const server = http.createServer();

const load_auth_code = async () => 
{
    // Open browser 
    const browser = await puppeteer.launch({ headless: false, userDataDir: BROWSER_DATA_DIR }); 

    AUTH_CODE = await new Promise(async (resolve, reject) => 
    {
        // Listen for auth code callback
        const serverListener = async (req, res) => {
            // Immediately end request
            res.end();
        
            // Check for auth code
            const url = req.url;
            const auth_code = url
                .replace('/callback?code=', '')
                .replace('&state=', '');

            resolve(auth_code);
        };
        server.addListener('request', serverListener);
        server.listen(7777);

        const scopes = ['user-read-private', 'user-read-email', 'playlist-modify-private', 'playlist-modify-public'];
        const state = '';

        // Create the authorization URL
        var authorizeURL = SPOTIFY_API.createAuthorizeURL(scopes, state);

        try 
        {
            // Open browser page and login using provided user/pass
            const page = await browser.newPage();
            await page.goto(authorizeURL);
            
            console.log("Entering username...");
            await page.focus('input#login-username');
            await page.keyboard.type(process.env.SPOTIFY_USER);

            console.log("Entering password...");
            await page.focus('input#login-password');
            await page.keyboard.type(process.env.SPOTIFY_PASS);

            console.log("Logging in...")
            await page.click('button#login-button');

            // if there is a verify/accept/aggree permissions button
            try 
            {
                console.log("Accepting permissions...");
                await page.waitForNavigation();
                if(await page.$('button#auth-accept'))
                {
                    await page.click('button#auth-accept');
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
    const data = await SPOTIFY_API.authorizationCodeGrant(AUTH_CODE);

    const { expires_in, access_token, refresh_token } = data.body;

    if(store.config.debug)
    {
        console.log('The token expires in ' + expires_in);
        console.log('The access token is ' + access_token);
        console.log('The refresh token is ' + refresh_token);
    }

    // Set the access token on the API object to use it in later calls
    SPOTIFY_API.setAccessToken(access_token);
    SPOTIFY_API.setRefreshToken(refresh_token);

    await SPOTIFY_API.refreshAccessToken();
}

const authenticate_user_guard = async () => 
{
    await load_auth_code();
    await refresh_access_token();
}

const search_track = async (query) => 
{
    await authenticate_user_guard();

    const data = await SPOTIFY_API.searchTracks(query, { limit: 1 });

    return data.body;
}

const create_playlist = async (name) => 
{
    await authenticate_user_guard();

    const data = await SPOTIFY_API.createPlaylist(name);

    return data.body;
}

const add_to_playlist = async (playlistId, trackUri) => 
{
    await authenticate_user_guard();

    // Check if track already added
    const data = await SPOTIFY_API.getPlaylistTracks(playlistId);
    const details = data.body;
    const tracks = details.items.map(i => i.track);
    const track = tracks.find(t => t.uri === trackUri);

    if(track)
    {
        // Track already added to playlist, skip
        return;
    }

    await SPOTIFY_API.addTracksToPlaylist(playlistId, [ trackUri ]);
}

// NOTE: Will take first in list if multiple playlists with same name.
// Use id if unique names is not guaranteed
const get_playlist_by_name = async (name) => 
{
    await authenticate_user_guard();

    const data = await SPOTIFY_API.getUserPlaylists();
    const playlists = data.body;

    const playlist = playlists.items.find(p => p.name === name);

    return playlist;
}

const get_or_create_playlist_by_name = async (name) => 
{
    await authenticate_user_guard();

    let data = await SPOTIFY_API.getUserPlaylists();
    const playlists = data.body;

    const playlist = playlists.items.find(p => p.name === name);

    if(playlist)
    {
        return playlist; 
    }

    // Create playlist
    data = await SPOTIFY_API.createPlaylist(name);

    return data.body;
}

const get_or_create_playlist_by_id = async (id, name) => 
{
    await authenticate_user_guard();

    let data = await SPOTIFY_API.getUserPlaylists();
    const playlists = data.body;

    const playlist = playlists.items.find(p => p.id === id);

    if(playlist)
    {
        return playlist; 
    }

    // Create playlist
    data = await SPOTIFY_API.createPlaylist(name);

    return data.body;
}

// TODO: Cache

module.exports = {
    search_track,
    create_playlist,
    add_to_playlist,
    get_playlist_by_name,
    get_or_create_playlist_by_name,
    get_or_create_playlist_by_id
};
