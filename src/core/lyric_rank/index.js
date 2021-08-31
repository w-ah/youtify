// includes
const rank_algo = require('./rank_algo');

const get_fingerprint_lyric = async (lines) => 
{
    // Clean lines
    const cleanedLines = rank_algo.get_clean_lines(lines);

    if(cleanedLines.length === 0)
    {
        return '';
    }

    // Rank the lines
    const rankedLines = await get_ranked_lines(cleanedLines);
    // Get highest ranked line (prefer earlier in list if multiple with same rank)
    const sorted = rankedLines.sort((a, b) => 
    {
        if(a.rank > b.rank)
        {
            return -1;
        }
        else if(a.rank < b.rank)
        {
            return 1;
        }
        return 0;
    });

    return sorted[0];
}

const get_fingerprint_lyric_from_str = async (str) => 
{
    // Extract raw lines
    const rawLines = str.split('\n');
    return get_fingerprint_lyric(rawLines);
}

const get_fingerprint_lyric_from_lines = async (lines) => 
{
    return get_fingerprint_lyric(lines);
}

const get_ranked_lines = async (lines) => 
{
    // Rank the lines
    const lineRanks = [];
    for(const line of lines)
    {
        const rank = await rank_algo.get_rank(line);

        lineRanks.push({
            line,
            rank
        });
    }

    // Filter out negative ranked lines
    return lineRanks.filter(r => r.rank >= 0);
}

module.exports = {
    get_fingerprint_lyric_from_str,
    get_fingerprint_lyric_from_lines
};