// includes
const youtube = require('./../../src/core/youtube');

async function fuzz(bytes)
{
    const str = bytes.toString();
    try 
    {
        await Promise.all([
            youtube.get_channel_video_urls(str),
            youtube.get_music_subtitles_str(str),
            youtube.download_audio_clip(str, __dirname + '/tmp/' + Date.now(), { start: Number(bytes), duration: Number(bytes) })
        ]);
    }
    catch(error)
    {
        if(!acceptable(error)) throw error;
    }
}

const acceptable = (error) => 
{
    return false;
}

module.exports = { fuzz };