// 3rd party includes
const puppeteer = require('puppeteer');

// includes
const spotm = require('./manager');
const auth_code_server = require('./auth_code_server');
const { BROWSER_DATA_DIR } = require('../constants'); 
const store = require('../store');
const { wait_s } = require('../utils/wait');

const load_auth_code = async () => 
{
    spotm.init_guard();

    // Open browser 
    const browser = await puppeteer.launch({ 
        headless: store.config.headless, 
        userDataDir: BROWSER_DATA_DIR, 
        defaultViewport: { 
            width: 1920, 
            height: 1080 
        },
        args: [
            '--no-sandbox'
        ]
    }); 

    const auth_code = await new Promise(async (resolve, reject) => 
    {
        let closed = false;

        // Listen for auth code callback
        const callbackHandler = (auth_code) => {
            closed = true;
            resolve(auth_code);
        };

        const scopes = ['user-read-private', 'user-read-email', 'playlist-modify-private', 'playlist-modify-public'];
        const state = Date.now();

        await auth_code_server.addCallbackHandler(state, callbackHandler);

        // Create the authorization URL
        const authorizeURL = spotm.get_api().createAuthorizeURL(scopes, state);

        if(store.config.debug)
        {
            console.log("Spotify authorize url:", authorizeURL)

        }

        try 
        {
            // Open browser page and login using provided user/pass
            const page = await browser.newPage();
            await page.goto(authorizeURL);
            
            await page.focus('input#login-username');
            await page.keyboard.type(process.env.SPOTIFY_USER);

            await wait_s(1);

            await page.focus('input#login-password');
            await page.keyboard.type(process.env.SPOTIFY_PASS);

            await wait_s(1);

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
                if(await page.$('button#auth-accept'))
                {
                    console.log("Accepting permissions...");

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
            // Skip
        }
    });

    spotm.set_auth_code(auth_code);

    await browser.close();
}

const refresh_access_token = async () => 
{
    // Retrieve an access token and a refresh token
    const data = await spotm.get_api().authorizationCodeGrant(spotm.get_auth_code());

    const { expires_in, access_token, refresh_token } = data.body;

    if(store.config.debug)
    {
        console.log('The token expires in ' + expires_in);
        console.log('The access token is ' + access_token);
        console.log('The refresh token is ' + refresh_token);
    }

    // Set the access token on the API object to use it in later calls
    spotm.get_api().setAccessToken(access_token);
    spotm.get_api().setRefreshToken(refresh_token);

    await spotm.get_api().refreshAccessToken();
}

const authenticate_user_guard = async () => 
{
    await load_auth_code();
    await refresh_access_token();
}

const search_track = async (query) => 
{
    await authenticate_user_guard();

    const data = await spotm.get_api().searchTracks(query, { limit: 1 });

    return data.body;
}

const create_playlist = async (name) => 
{
    await authenticate_user_guard();

    const data = await spotm.get_api().createPlaylist(name);

    return data.body;
}

const add_to_playlist = async (playlistId, trackUri) => 
{
    await authenticate_user_guard();

    // Check if track already added
    const data = await spotm.get_api().getPlaylistTracks(playlistId);
    const details = data.body;
    const tracks = details.items.map(i => i.track);
    const track = tracks.find(t => t.uri === trackUri);

    if(track)
    {
        // Track already added to playlist, skip
        return;
    }

    // TODO: Add to start vs. end of playlist using { position: 0 } option
    await spotm.get_api().addTracksToPlaylist(playlistId, [ trackUri ], );
}

// NOTE: Will take first in list if multiple playlists with same name.
// Use id if unique names is not guaranteed
const get_playlist_by_name = async (name) => 
{
    await authenticate_user_guard();

    const data = await spotm.get_api().getUserPlaylists();
    const playlists = data.body;

    const playlist = playlists.items.find(p => p.name === name);

    return playlist;
}

const get_or_create_playlist_by_name = async (name) => 
{
    await authenticate_user_guard();

    let data = await spotm.get_api().getUserPlaylists();
    const playlists = data.body;

    const playlist = playlists.items.find(p => p.name === name);

    if(playlist)
    {
        return playlist; 
    }

    // Create playlist
    data = await spotm.get_api().createPlaylist(name);

    return data.body;
}

const get_or_create_playlist_by_id = async (id, name) => 
{
    await authenticate_user_guard();

    let data = await spotm.get_api().getUserPlaylists();
    const playlists = data.body;

    const playlist = playlists.items.find(p => p.id === id);

    if(playlist)
    {
        return playlist; 
    }

    // Create playlist
    data = await spotm.get_api().createPlaylist(name);

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
