// 3rd party includes
const path = require('path');

const TMP_DIR = path.resolve(__dirname, '../tmp');
// TODO: Be able to specify this dynamically
const MUSIC = path.resolve(__dirname, '../../music.mp3');
const TMP_MUSIC = path.resolve(TMP_DIR, 'music.mp3');
const TMP_CLIP = path.resolve(TMP_DIR, 'clip.mp3');

module.exports = {
    MUSIC,
    TMP_DIR,
    TMP_MUSIC,
    TMP_CLIP
}