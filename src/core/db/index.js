// includes
const manager = require('./manager');
const spotify_playlists = require('./spotify-playlists');

const init = async () => 
{
    await manager.init();

    // init tables
    await spotify_playlists.init();
}

module.exports = {
    init,
    spotify_playlists
};