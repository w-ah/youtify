// 3rd party includes
const fs = require('fs');
const path = require('path');
const ytdl = require('ytdl-core');
const puppeteer = require('puppeteer');

// includes
const { BROWSER_DATA_DIR } = require('../constants');

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

// NOTE: Only gets the first page of videos
// TODO: Paging/ iterate pages
const get_channel_video_urls = async (name) => 
{
    const browser = await puppeteer.launch({ 
        headless: false, 
        userDataDir: BROWSER_DATA_DIR, 
        defaultViewport: { 
            width: 1920, 
            height: 1080 
        } 
    }); 
    const page = await browser.newPage();

    let pageUrls = [
        `https://www.youtube.com/c/${name.toLowerCase()}/videos`,
        `https://www.youtube.com/user/${name.toLowerCase()}/videos`,
        `https://www.youtube.com/${name.toLowerCase()}/videos`
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
    download_video
};