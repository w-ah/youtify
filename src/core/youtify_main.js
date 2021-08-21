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

const { TMP_DIR, TMP_VID, TMP_VID_AUDIO, TMP_AUDIO, TMP_AUDIO_CLIP, DATA_DIR } = require('./constants');

const start = async () => 
{
    await init();

    const { channels } = store.config;

    console.log("Processing channels...");
    for(const channel of channels.map(c => c.toLowerCase()))
    {
        console.log("Processing channel: ", channel);
        await add_channel_tracks_to_spotify_playlist({ channel });
    }
}

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

const add_channel_tracks_to_spotify_playlist = async ({ channel }) => 
{
    console.log("Getting channel video urls...")
    const urls = await youtube.get_channel_video_urls(channel);
    
    // TODO: Parallel
    console.log("Processing videos...");
    for(url of urls)
    {
        console.log("Processing video: ", url);
        await add_url_track_clips_to_spotify_playlist({ channel, url });
    }
}

const add_url_track_clips_to_spotify_playlist = async ({ channel, url }) => 
{
    const ytUrl = url;

    // Download youtube video
    console.log("Downloading video...");
    // TODO: Retryable
    await youtube.download_video(ytUrl, TMP_VID);

    // Convert video to mp3
    console.log("Extracting video audio...");
    await media.mp4_file_to_mp3_file(TMP_VID);

    // Get audio track length
    // Split track into multiple clips
    const duration = 7;
    const clips = [
        10, 30, 60
    ];
    // Loops the clips
    console.log("Processing audio clips...");
    for(const start of clips)
    {
        console.log("Processing audio clip: t =", start);
        await add_track_clip_to_spotify_playlist(channel, { start, duration });
    }
}

const add_track_clip_to_spotify_playlist = async (channel, { start, duration }) => 
{
    // Clip to 5 seconds - TODO: What is the best length and where should we
    // sample this from a longer clip?
    // NOTE: For now we just clip the start of the given file. Could generate multiple clips in future?

    // Clip
    console.log("Clipping audio...");
    try
    {
        fs.copyFileSync(TMP_VID_AUDIO, TMP_AUDIO);
    }
    catch(e)
    {
        if(store.config.debug)
        {
            console.log(e);
        }
        // skip
    }
    await media.clip(TMP_AUDIO, TMP_AUDIO_CLIP, start, duration);

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

            console.log("Adding track to Spotify playlist...");

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