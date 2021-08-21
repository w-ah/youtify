// includes
const manager = require('./manager');
const spotify_playlists = require('./spotify_playlists');
const audio_clips = require('./audio_clips');

const init = async () => 
{
    await manager.init();

    // init tables
    await spotify_playlists.init();
    await audio_clips.init();
}

module.exports = {
    init,
    spotify_playlists,
    audio_clips
};