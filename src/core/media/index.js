// includes
const clipper = require('./clipper');
const converter = require('./converter');

const clip = clipper.clip;
const mp3_file_to_ogg_file = converter.mp3_file_to_ogg_file;
const mp4_file_to_mp3_file = converter.mp4_file_to_mp3_file;

module.exports = {
    clip, 
    mp3_file_to_ogg_file,
    mp4_file_to_mp3_file
};