// 3rd party includes
const path = require('path');

const TMP_DIR = path.resolve(__dirname, '../tmp');
// TODO: Be able to specify this dynamically
const TMP_VID = path.resolve(TMP_DIR, 'video.mp4');
const TMP_VID_AUDIO = path.resolve(TMP_DIR, 'video.mp3');
const TMP_AUDIO = path.resolve(TMP_DIR, 'audio.mp3');
const TMP_AUDIO_CLIP = path.resolve(TMP_DIR, 'clip.mp3');

module.exports = {
    TMP_DIR,
    TMP_VID,
    TMP_VID_AUDIO,
    TMP_AUDIO,
    TMP_AUDIO_CLIP
}