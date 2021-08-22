// 3rd party includes
const fs = require('fs');

// includes
const db = require('./db');
const store = require('./shared_store');
const media = require('./media');
const shazam = require('./shazam');
const youtube = require('./youtube');
const spotify = require('./spotify');

const { TMP_VID, TMP_VID_AUDIO, TMP_AUDIO, TMP_AUDIO_CLIP } = require('./constants');

const run = async ({ channel }) => 
{
    const lChannel = channel.toLowerCase();
    console.log("Processing channel: ", lChannel);
    await add_channel_tracks_to_spotify_playlist({ channel: lChannel });   
}

const add_channel_tracks_to_spotify_playlist = async ({ channel }) => 
{
    console.log("Getting channel video urls...")
    const urls = (await youtube.get_channel_video_urls(channel));

    console.log(`Got ${urls.length} video urls`);
    
    // TODO: Parallel
    console.log("Processing videos...");
    for(let i = 0; i < urls.length; ++i)
    {
        const url = urls[i];
        console.log(`Processing video ${i + 1} of ${urls.length}: ${url}`);
        await add_url_track_clips_to_spotify_playlist({ channel, url });
    }
}

const add_url_track_clips_to_spotify_playlist = async ({ channel, url }) => 
{
    // Download youtube video
    console.log("Downloading video...");
    // TODO: Retryable
    // TODO: Is there something better we can do for longer videos? - Just download the part we need for a given clip within the clip method?
    await youtube.download_video(url, TMP_VID);

    // Convert video to mp3
    console.log("Extracting video audio...");
    await media.mp4_file_to_mp3_file(TMP_VID);

    // Get audio track length
    // Split track into multiple clips
    const duration = 5;
    const clips = [
        10, 20, 30, 40, 50 , 60
    ];
    // Loops the clips
    console.log("Processing audio clips...");
    for(const start of clips)
    {
        console.log("Processing audio clip: t =", start);
        await add_track_clip_to_spotify_playlist({ channel, url }, { start, duration });
    }
}

const add_track_clip_to_spotify_playlist = async ({ channel, url }, { start, duration }) => 
{
    if(await processed_clip_guard({ channel, url }, { start, duration }))
    {
        console.log("Audio clip already processed. Skipping...");
        return;
    }

    // Get / Create playlist
    const playlistDetails = await spotify.get_or_create_playlist_by_name(channel);
    const { id: playlistId } = playlistDetails;
    await db.spotify_playlists.add_playlist({ id: playlistId, name: channel });

    // TODO: What is the best length and where should we sample this from a longer clip?

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

            // Add track to playlist
            await spotify.add_to_playlist(playlistId, trackUri);
        }
        else 
        {
            console.log("Failed to find audio on Spotify");
        }
    }

    // track processed clips so we can skip processing in future.
    await db.audio_clips.add_clip({ 
        youtube_url: url, 
        spotify_playlist_id: playlistId, 
        start, 
        duration 
    });
}

const processed_clip_guard = async ({ channel, url }, { start, duration }) => 
{
    // Check we have not already processed this clip at some point in the past
    const playlist = await db.spotify_playlists.get_playlist_by_name({ name: channel });
    if(playlist)
    {
        const clip_exists = await db.audio_clips.clip_exists({
            youtube_url: url,
            spotify_playlist_id: playlist.id,
            start,
            duration
        });

        return clip_exists;
    }
}

module.exports = {
    run
};