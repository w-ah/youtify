const dbm = require('./manager');

const TABLE_NAME = "audio_clips";

const init = async () => 
{
    await create();
}

const create = async () => 
{
    const db = await dbm.get_handle();

    await db.exec(`
        CREATE TABLE IF NOT EXISTS ${TABLE_NAME} ( 
            youtube_url TEXT,
            spotify_playlist_id TEXT,
            start INT,
            duration INT
        )
    `);
}

const add_clip = async ({ youtube_url, spotify_playlist_id, start, duration }) => 
{
    const db = await dbm.get_handle();

    await db.run(`
        INSERT INTO ${TABLE_NAME} ( youtube_url, spotify_playlist_id, start, duration )
        VALUES ('${youtube_url}', '${spotify_playlist_id}', '${start}', '${duration}'),
        WHERE NOT EXISTS (SELECT 1 FROM ${TABLE_NAME} WHERE youtube_url='${youtube_url}' AND spotify_playlist_id='${spotify_playlist_id}' AND start='${start}' AND duration='${duration}')
    `);
}

const get_clip = async ({ youtube_url, spotify_playlist_id, start, duration }) => 
{
    const db = await dbm.get_handle();

    const clip = await db.get(`
        SELECT * FROM ${TABLE_NAME} 
        WHERE youtube_url='${youtube_url}' AND spotify_playlist_id='${spotify_playlist_id}' AND start='${start}' AND duration='${duration}'
    `);

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