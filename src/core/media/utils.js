const s_to_hms = (seconds) => 
{
    const min = 60;
    const hour =  60 * min;

    const hours = Math.floor(seconds / hour);
    const mins = Math.floor((seconds % hour) / min);
    const secs = seconds % min;

    let hoursStr = String(hours);
    if(hoursStr.length == 1)
    {
        hoursStr = "0" + hoursStr;
    }

    let minsStr = String(mins);
    if(minsStr.length === 1)
    {
        minsStr = "0" + minsStr;
    }

    let secsStr = String(secs);
    if(secsStr.length === 1)
    {
        secsStr = "0" + secsStr;
    }

    return `${hoursStr}:${minsStr}:${secsStr}`;
}

module.exports = {
    s_to_hms
};