// 3rd party includes
const fs = require('fs');
const puppeteer = require('puppeteer');

// includes
const proc = require('../proc');
const store = require('../shared_store');
const media = require('../media');
const { BROWSER_DATA_DIR, TMP_SUBTITLES } = require('../constants');

const download_audio_clip = async (url, outFile, { start, duration }) => 
{
    const { audio } = await get_download_urls(url);
    await media.download_audio_clip_from_url(audio, outFile, { start, duration });
}

const get_download_urls = async (url) => 
{
    const cmdExpr = `youtube-dl --youtube-skip-dash-manifest -g ${url}`;
    const out = await proc.run_shell(cmdExpr, { returnOutput: true });

    const urls = out.split('\n');
    const video = urls[0];
    const audio = urls[1];

    return {
        video,
        audio
    }
}

const download_subtitles = async (url, outFile) => 
{
    // Preprare output file
    fs.writeFileSync(outFile, '');
    const cmdExpr = `youtube-dl --sub-lang en --write-auto-sub --sub-format vtt --skip-download -o ${TMP_SUBTITLES.replace('.en.vtt', '')} ${url}`;
    await proc.run_shell(cmdExpr); 

    if(TMP_SUBTITLES != outFile && fs.existsSync(TMP_SUBTITLES))
    {
        fs.copyFileSync(TMP_SUBTITLES, outFile);
    }
}

const get_subtitles_str = async (url) => 
{
    await download_subtitles(url, TMP_SUBTITLES);
    // Read subtitles file
    const str = fs.readFileSync(TMP_SUBTITLES).toString();
    return str;
}

const get_music_subtitles_str = async (url) => 
{
    const str = await get_subtitles_str(url);

    if(str.includes('[Music]'))
    {
        return str;
    }
    return '';
}

// NOTE: Only gets the first page of videos
// TODO: Paging/ iterate pages
const get_channel_video_urls = async (name) => 
{
    // TODO: Use interpolation to work out screen height from configured update size.
    // TODO: Max update size
    // 1080 = 30
    // 1920 = 60
    // 2160 = 

    const browser = await puppeteer.launch({ 
        headless: store.config.headless, 
        userDataDir: BROWSER_DATA_DIR, 
        defaultViewport: { 
            width: 1920, 
            height: 2160 
        } 
    }); 
    const page = await browser.newPage();

    const lName = name.toLowerCase();
    let pageUrls = [
        `https://www.youtube.com/c/${lName}/videos`,
        `https://www.youtube.com/user/${lName}/videos`,
        `https://www.youtube.com/${lName}/videos`
    ];
    const videoUrls = [];
    let done = false;

    while(!done && pageUrls[0])
    {
        const pageUrl = pageUrls[0];

        try 
        {
            const res = await page.goto(pageUrl);

            if(res.ok())
            {
                if(page.url().includes('consent'))
                {
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    await page.hover('form button');
                    await page.click('form button'); // accept data and cookie policy
                    await page.waitForNavigation();
                }
                
                // get list container
                const listContainer = await page.$('div#primary');
                const thumbnails = await listContainer.$$('#thumbnail');

                for(const thumbnail of thumbnails)
                {
                    const href = await thumbnail.evaluate(t => t.href);
                    videoUrls.push(href);
                }

                done = true;
            }
        }
        catch(e)
        {
            // Skip error - just try next url
        }
        
        // Try next url
        pageUrls = pageUrls.slice(1);
    }

    await browser.close();

    return videoUrls;
}



module.exports = {
    get_channel_video_urls,
    download_audio_clip,
    get_music_subtitles_str
};