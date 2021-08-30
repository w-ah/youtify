// includes
const dbm = require('./manager');
const { DATA_VERSION } = require('../constants');

const TABLE_NAME = "audio_clips";

const init = async () => 
{
    await create();
}

const create = async () => 
{
    const db = await dbm.get_handle();

    await db.prepare(`
        CREATE TABLE IF NOT EXISTS ${TABLE_NAME} ( 
            youtube_url TEXT,
            spotify_playlist_id TEXT,
            start INT,
            duration INT,
            _dav INT
        )
    `).run();
}

const add_clip = async ({ youtube_url, spotify_playlist_id, start, duration }) => 
{
    if(await clip_exists({ youtube_url, spotify_playlist_id, start, duration }))
    {
        // Skip
        return;
    }

    const db = await dbm.get_handle();

    await db.prepare(`
        INSERT INTO ${TABLE_NAME} ( youtube_url, spotify_playlist_id, start, duration, _dav )
        VALUES ('${youtube_url}', '${spotify_playlist_id}', '${start}', '${duration}', '${DATA_VERSION}')
    `).run();
}

const get_clip = async ({ youtube_url, spotify_playlist_id, start, duration }) => 
{
    const db = await dbm.get_handle();

    const clip = await db.prepare(`
        SELECT * FROM ${TABLE_NAME} 
        WHERE youtube_url='${youtube_url}' AND spotify_playlist_id='${spotify_playlist_id}' AND start='${start}' AND duration='${duration}' AND _dav=${DATA_VERSION}
    `).get();

    return clip;
}

const clip_exists = async ({ youtube_url, spotify_playlist_id, start, duration }) => 
{
    const clip = await get_clip({ youtube_url, spotify_playlist_id, start, duration });

    return clip ? true : false;
}

module.exports = {
    init,
    create,
    add_clip,
    get_clip,
    clip_exists
}