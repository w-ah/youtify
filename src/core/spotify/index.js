// 3rd party includes
const http = require('http');
const Spotify = require('spotify-web-api-node');
const puppeteer = require('puppeteer');

// NOTE: What if the port becomes un-available before starting the http server?
const credentials = {
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: 'http://localhost:7777/callback' // NOTE: This must be whitelisted in your developer account spotify app settings
};
const SPOTIFY_API = new Spotify(credentials);

// The code that's returned as a query parameter to the redirect URI
let auth_code = '';

const load_auth_code = async () => 
{
    if(auth_code.length > 0)
    {
        // Already set, skip
        return;
    }

    auth_code = await new Promise(async (resolve, reject) => 
    {
        // Open browser 
        const browser = await puppeteer.launch({ headless: false });

        // Create HTTP server to get the access code from re-direct
        const server = http.createServer(async (req, res) => {
            // Immediately end request
            res.end();
            // Close the browser - we don't need it anymore
            await browser.close();

            // Check for auth code
            const url = req.url;
            const auth_code = url
                .replace('/callback?code=', '')
                .replace('&state=', '');

            console.log(auth_code);

            resolve(auth_code);
        }).listen(7777); //the server object listens on port 7777 

        const scopes = ['user-read-private', 'user-read-email'];
        const state = '';

        // Create the authorization URL
        var authorizeURL = SPOTIFY_API.createAuthorizeURL(scopes, state);

        try 
        {
            // Open browser page and login using provided user/pass
            const page = await browser.newPage();
            await page.goto(authorizeURL);
            
            await page.focus('input#login-username');
            await page.keyboard.type(process.env.SPOTIFY_USER);

            await page.focus('input#login-password');
            await page.keyboard.type(process.env.SPOTIFY_PASS);

            await page.click('button#login-button');
        }
        catch(e)
        {
            reject(e);
        }
    });
}

const refresh_access_token = async () => 
{
    // Retrieve an access token and a refresh token
    const data = await SPOTIFY_API.authorizationCodeGrant(auth_code);
    
    console.log('The token expires in ' + data.body['expires_in']);
    console.log('The access token is ' + data.body['access_token']);
    console.log('The refresh token is ' + data.body['refresh_token']);

    // Set the access token on the API object to use it in later calls
    SPOTIFY_API.setAccessToken(data.body['access_token']);
    SPOTIFY_API.setRefreshToken(data.body['refresh_token']);

    await SPOTIFY_API.refreshAccessToken();
}

const authenticate_user_guard = async () => 
{
    await load_auth_code();
    await refresh_access_token();
}

const get_track = async (searchUri) => 
{
    await authenticate_user_guard();

    const data = await SPOTIFY_API.searchTracks(searchUri, { limit: 1 });

    return data.body;
}

module.exports = {
    get_track
};
