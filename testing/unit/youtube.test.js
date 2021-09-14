const path = require('path');

const youtube = require('./../../src/core/youtube');

describe('youtube', () => 
{
    describe('#get_channel_video_urls', () => 
    {
        test.concurrent('it should get youtube urls from user', async () => 
        {
            const urls = await youtube.get_channel_video_urls("bbc");

            expect(urls.length).toBeDefined();
            expect(urls.length).toBeGreaterThanOrEqual(0);
        }, 30_000);

        test.concurrent('it should get youtube urls from channel', async () => 
        {
            const urls = await youtube.get_channel_video_urls("bbcsport");

            expect(urls.length).toBeDefined();
            expect(urls.length).toBeGreaterThanOrEqual(0);
        }, 30_000);

        test.concurrent('it should be case insensitive', async () => 
        {
            const urls = await youtube.get_channel_video_urls("BbCsPoRt");

            expect(urls.length).toBeDefined();
            expect(urls.length).toBeGreaterThanOrEqual(0);
        }, 30_000);
    });

    describe('#download_audio_clip', () => 
    {
        test.concurrent('should download clip from url', async () => 
        {
            const url = "https://www.youtube.com/watch?v=ffMgFb7nMXU";
            const out = path.resolve(__dirname, 'tmp', Date.now().toString())
            await youtube.download_audio_clip(url, out, { start: 0, duration: 5 });
        });
    });
});