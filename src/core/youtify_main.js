// 3rd party includes
const fs = require('fs');
const path = require('path');

// includes
const config = require('./config_service');
const store = require('./shared_store');
const music_clipper = require('./media/clipper');
const music_converter = require('./media/converter');
const shazam = require('./shazam');
const youtube = require('./youtube');
const spotify = require('./spotify');

const { TMP_DIR, TMP_VID, TMP_VID_AUDIO, TMP_AUDIO, TMP_AUDIO_CLIP } = require('./constants');

const start = async () => 
{
    // Load config
    config.load();

    // Cleanup
    if(fs.existsSync(TMP_DIR))
    {
        fs.rmSync(TMP_DIR, { recursive: true });
    }

    fs.mkdirSync(TMP_DIR, { recursive: true });

    const ytUrl = 'https://www.youtube.com/watch?v=ZbZSe6N_BXs';

    // Download youtube video
    console.log("Downloading youtube video...");
    await youtube.download_video(ytUrl, TMP_VID);

    // Convert video to mp3
    console.log("Extracting video audio...");
    await music_converter.mp4_file_to_mp3_file(TMP_VID);

    // Clip to 5 seconds - TODO: What is the best length and where should we
    // sample this from a longer clip?
    // NOTE: For now we just clip the start of the given file. Could generate multiple clips in future?

    // Clip
    console.log("Clipping audio...");
    const clipIntro = 5; // Intro length
    fs.copyFileSync(TMP_VID_AUDIO, TMP_AUDIO);
    await music_clipper.clip(TMP_AUDIO, TMP_AUDIO_CLIP, clipIntro, 5);

    // Convert to ogg
    console.log("Converting audio to ogg...");
    await music_converter.mp3_file_to_ogg_file(TMP_AUDIO_CLIP);

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
        const searchResult = await spotify.get_track(`artist:${artist} title:${title}`);

        if(searchResult.tracks.items.length > 0)
        {
            console.log("Found...");
            const result = searchResult.tracks.items[0];
            console.log(result);
        }

        // TODO
        
        // // Create playlist
        // await spotify.create_playlist("Testing123");

        // // Add song to playlist
        // await spotify.add_to_playlist(trackUri, playlist);
        
    }
}

module.exports = {
    start
};