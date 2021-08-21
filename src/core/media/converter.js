// 3rd party includes
const fs = require('fs');
const path = require('path');

// includes
const proc = require('../proc');

const mp3_file_to_raw_file = async (file) => 
{
    const normPath = path.normalize(file);
    const pathNoExt = normPath.replace(/.mp3/, '');

    const mp3Path = `${pathNoExt}.mp3`;
    const wavPath = `${pathNoExt}.wav`;
    const rawPath = `${pathNoExt}.raw`;

    // Clean up any previous conversion results
    if(fs.existsSync(wavPath))
    {
        fs.rmSync(wavPath, { recursive: true });
    }
    if(fs.existsSync(rawPath))
    {
        fs.rmSync(rawPath, { recursive: true });
    }

    // Convert mp3 to wav
    {
        const cmdExpr = `ffmpeg -i "${mp3Path}" "${wavPath}"`;
        await proc.run_shell(cmdExpr);
    }

    // Convert wav to raw
    {
        const cmdExpr = `sox -r 48k  -b 16 -L -c 1 "${wavPath}" "${rawPath}"`;
        await proc.run_shell(cmdExpr);
    }

    // Clean up intermediate .wav file
    if(fs.existsSync(wavPath))
    {
        fs.rmSync(wavPath, { recursive: true });
    }
}

const mp3_file_to_ogg_file = async (file) => 
{
    const normPath = path.normalize(file);
    const pathNoExt = normPath.replace(/.mp3/, '');

    const mp3Path = `${pathNoExt}.mp3`;
    const oggPath = `${pathNoExt}.ogg`;

    // Clean up any previous conversion results
    if(fs.existsSync(oggPath))
    {
        fs.rmSync(oggPath, { recursive: true });
    }

    // Convert mp3 to ogg
    {
        const cmdExpr = `ffmpeg -i "${mp3Path}" -c:a libvorbis -q:a 4 "${oggPath}"`;
        await proc.run_shell(cmdExpr);
    }
} 

const mp4_file_to_mp3_file = async (file) => 
{
    const normPath = path.normalize(file);
    const pathNoExt = normPath.replace(/.mp4/, '');

    const mp4Path = `${pathNoExt}.mp4`;
    const mp3Path = `${pathNoExt}.mp3`;

    // Clean up any previous conversion results
    if(fs.existsSync(mp3Path))
    {
        fs.rmSync(mp3Path, { recursive: true });
    }
    
    // Convert mp4 to mp3
    {
        const cmdExpr = `ffmpeg -i ${mp4Path} ${mp3Path}`;
        await proc.run_shell(cmdExpr);
    }
}

module.exports = {
    mp3_file_to_raw_file,
    mp3_file_to_ogg_file,
    mp4_file_to_mp3_file
}