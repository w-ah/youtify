// 3rd party includes
const path = require('path');

const DATA_VERSION = 1;

const TMP_DIR = path.resolve(__dirname, '../tmp');
// TODO: Be able to specify this dynamically
const TMP_AUDIO_CLIP = path.resolve(TMP_DIR, 'clip.mp3');
const TMP_SUBTITLES = path.resolve(TMP_DIR, 'subtitles.en.vtt');
const DATA_DIR = path.resolve(__dirname, '../data');
const BROWSER_DATA_DIR = path.resolve(DATA_DIR, 'browser');
const DB_DATA_DIR = path.resolve(DATA_DIR, 'db');
const DB_DATA_FILE = path.resolve(DB_DATA_DIR, 'youtify.db');

module.exports = {
    DATA_VERSION,
    TMP_DIR,
    TMP_AUDIO_CLIP,
    TMP_SUBTITLES,
    DATA_DIR,
    BROWSER_DATA_DIR,
    DB_DATA_DIR,
    DB_DATA_FILE
}