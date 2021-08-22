// includes
const proc = require('../proc');
const { s_to_hms } = require('./utils');

// NOTE: Overwrites the original file
const clip = async (input, output, start, duration) => 
{
    const startStr = s_to_hms(start);
    const durationStr = s_to_hms(duration);
    const cmdExpr = `ffmpeg -i ${input} -y -acodec copy -ss ${startStr} -t ${durationStr} ${output}`;

    await proc.run_shell(cmdExpr);
}

module.exports = {
    clip
};