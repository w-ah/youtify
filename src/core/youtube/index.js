// 3rd party includes
const fs = require('fs');
const path = require('path');
const ytdl = require('ytdl-core');

const download_video = (url, outFile) => 
{
    return new Promise((resolve, reject) => 
    {
        const stream = ytdl(url)
            .pipe(fs.createWriteStream(outFile));

        stream.on('finish', resolve);
        stream.on('error', e => 
        {
            console.log(e);
            reject();
        })
    });
}

const download_audio = async (url, outFile) => 
{

}

module.exports = {
    download_video,
    download_audio
};