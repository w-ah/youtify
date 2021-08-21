// 3rd party includes
const fs = require('fs');

// includes
const config = require('./config_service');
const db = require('./db');
const store = require('./shared_store');
const media = require('./media');
const shazam = require('./shazam');
const youtube = require('./youtube');
const spotify = require('./spotify');

const retry = require('./utils/retry');

const { TMP_DIR, TMP_VID, TMP_VID_AUDIO, TMP_AUDIO, TMP_AUDIO_CLIP, DATA_DIR } = require('./constants');

const init = async () => 
{
    // Load config
    config.load();

    if(store.config.debug)
    {
        console.log("Using config: \n", JSON.stringify(store.config, null, 4));
    }

    // Cleanup
    console.log("Cleaning up old temporary files...");
    if(fs.existsSync(TMP_DIR))
    {
        fs.rmSync(TMP_DIR, { recursive: true });
    }

    // Init data dirs
    fs.mkdirSync(TMP_DIR, { recursive: true });
    fs.mkdirSync(DATA_DIR, { recursive: true });

    // Init db
    console.log("Initialising DB...");
    await db.init();
}

const start = async () => 
{
    await init();

    const channel = store.config.channels[0];
    const urls = await youtube.get_channel_video_urls(channel);

    const ytUrl = urls[0];

    // Download youtube video
    console.log("Downloading youtube video...");
    // TODO: Retryable
    await retry(youtube.download_video)(ytUrl, TMP_VID);

    // Convert video to mp3
    console.log("Extracting video audio...");
    await media.mp4_file_to_mp3_file(TMP_VID);

    // Clip to 5 seconds - TODO: What is the best length and where should we
    // sample this from a longer clip?
    // NOTE: For now we just clip the start of the given file. Could generate multiple clips in future?

    // Clip
    console.log("Clipping audio...");
    const clipIntro = 5; // seconds
    const clipDuration = 5; // seconds
    fs.copyFileSync(TMP_VID_AUDIO, TMP_AUDIO);
    await media.clip(TMP_AUDIO, TMP_AUDIO_CLIP, clipIntro, clipDuration);

    // Convert to ogg
    console.log("Converting audio to ogg...");
    await media.mp3_file_to_ogg_file(TMP_AUDIO_CLIP);

    // Send to shazam to get back matching song details
    console.log("Getting audio details via Shazam...");
    const shazamDetails = await shazam.recognize_song(TMP_AUDIO_CLIP);

    // Handle no matches
    if(shazamDetails.matches.length === 0)
    {
        console.log("Audio not recognized");
    }
    else 
    {
        console.log("Audio recognized:");

        // Pick search properties
        const title = shazamDetails.track.title;
        const artist = shazamDetails.track.subtitle;

        console.log(` > Artist: ${artist}`);
        console.log(` > Title: ${title}`);

        // Search spotify for song
        console.log("Searching Spotify...");
        const searchResult = await spotify.search_track(`${artist} ${title}`);

        if(searchResult.tracks.items.length > 0)
        {
            const trackDetails = searchResult.tracks.items[0];
            const { uri: trackUri } = trackDetails;

            // Get / Create playlist
            const playlistDetails = await spotify.get_or_create_playlist_by_name(channel);
            const { id: playlistId } = playlistDetails;

            await db.spotify_playlists.add_playlist({ id: playlistId, name: channel });

            // Add track to playlist
            await spotify.add_to_playlist(playlistId, trackUri);
        }
        else 
        {
            console.log("Failed to find audio on Spotify");
        }
    }
}

module.exports = {
    start
};