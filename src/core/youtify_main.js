// 3rd party includes
const fs = require('fs');
const path = require('path');

// includes
const { MUSIC, TMP_DIR, TMP_MUSIC, TMP_CLIP } = require('./constants');
const config = require('./config_service');
const music_clipper = require('./music_clipper');
const music_converter = require('./music_converter');
const shazam = require('./shazam');

const start = async () => 
{
    // Load config
    config.load();

    // Cleanup
    if(fs.existsSync(TMP_DIR))
    {
        fs.rmSync(TMP_DIR, { recursive: true });
    }

    // Copy files to tmp
    fs.mkdirSync(TMP_DIR);
    fs.copyFileSync(MUSIC, TMP_MUSIC);

    // Clip to 5 seconds - TODO: What is the best length and where should we
    // sample this from a longer clip?
    // NOTE: For now we just clip the start of the given file. Could generate multiple clips in future?

    // Clip
    console.log("Clipping audio...");
    fs.copyFileSync(TMP_MUSIC, TMP_CLIP);
    await music_clipper.clip(TMP_MUSIC, TMP_CLIP, 0, 5);

    // Convert to ogg
    console.log("Converting audio to ogg...");
    await music_converter.mp3_file_to_ogg_file(TMP_CLIP);

    // Send to shazam to get back matching song details
    console.log("Getting audio details via Shazam...");
    const shazamDetails = await shazam.recognize_song(TMP_CLIP);

    // TODO: Handle when no match found

    // Pick search properties
    const title = shazamDetails.track.title;
    const artist = shazamDetails.track.subtitle;
    console.log({ artist, title });

    // Search spotify for song
    console.log("Searching Spotify...");
}

module.exports = {
    start
};