// 3rd party includes
const puppeteer = require('puppeteer');

// includes
const proc = require('../proc');
const store = require('../shared_store');
const media = require('../media');
const { BROWSER_DATA_DIR } = require('../constants');

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

// NOTE: Only gets the first page of videos
// TODO: Paging/ iterate pages
const get_channel_video_urls = async (name) => 
{
    const browser = await puppeteer.launch({ 
        headless: store.config.headless, 
        userDataDir: BROWSER_DATA_DIR, 
        defaultViewport: { 
            width: 1920, 
            height: 1080 
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
    download_audio_clip
};