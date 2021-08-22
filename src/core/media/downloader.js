// includes
const proc = require('../proc');
const { s_to_hms } = require('./utils');

const download_clip_from_urls = async ({ video, audio }, outFile, { start, duration }) => 
{
    const startStr = s_to_hms(start);
    const durationStr = s_to_hms(duration);

    const videoStr = video ? `-ss ${startStr} -i "${video}"` : '';
    const audioStr = audio ? `-ss ${startStr} -i "${audio}"`: '';

    const cmdExpr = `ffmpeg ${videoStr} ${audioStr} -y -t ${durationStr} ${outFile}`;
    await proc.run_shell(cmdExpr);
}

const download_audio_clip_from_url = async (url, outFile, { start, duration }) => 
{
    return download_clip_from_urls({ audio: url }, outFile, { start, duration });
}

module.exports = {
    download_audio_clip_from_url
};