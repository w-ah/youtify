// includes
const clipper = require('./clipper');
const converter = require('./converter');
const downloader = require('./downloader');

const clip = clipper.clip;
const mp3_file_to_ogg_file = converter.mp3_file_to_ogg_file;
const mp4_file_to_mp3_file = converter.mp4_file_to_mp3_file;
const download_audio_clip_from_url = downloader.download_audio_clip_from_url;

module.exports = {
    clip, 
    mp3_file_to_ogg_file,
    mp4_file_to_mp3_file,
    download_audio_clip_from_url
};