// 3rd party includes
const WordPOS = require('wordpos');
const WPOS = new WordPOS();

// NOTE: Higher = Better
const get_rank = async (line) => 
{
    // Get composition
    let lineComposition = null;
    try 
    {
        lineComposition = await WPOS.getPOS(line);
    }
    catch(e)
    {
        return -1;
    }

    const { verbs, adjectives, adverbs, rest } = lineComposition;

    if(adjectives.length === 0 && adverbs.length === 0 && rest.length === 0)
    {
        // Esentially ignore this line
        return -1;
    }

    return verbs.length + adjectives.length + adverbs.length + rest.length;
}   

const get_clean_lines = (lines) => 
{
    const cleaned = [];

    for(let i = 0; i < lines.length; ++i)
    {
        // Skip first 3 lines (headers)
        if(i < 3)
        {
            continue;
        }

        const line = lines[i];

        // Skip timestamp lines
        if(line.match(/.*:.*:.*\..*/))
        {
            continue;
        }

        // Skip duplicates
        if(cleaned.includes(line))
        {
            continue;
        }

        // Skip descriptions
        if(line.match(/\[.*\]/))
        {
            continue;
        }

        // Skip empty
        if(line.trim().length === 0)
        {
            continue;
        }

        // Skip 1 word lines
        if(line.split(' ').length === 1)
        {
            continue;
        }

        cleaned.push(line);
    }

    return cleaned;
}

module.exports = {
    get_rank,
    get_clean_lines
};