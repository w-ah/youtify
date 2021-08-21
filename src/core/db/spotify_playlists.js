const dbm = require('./manager');

const TABLE_NAME = "spotify_playlists";

const init = async () => 
{
    await create();
}

const create = async () => 
{
    const db = await dbm.get_handle();

    await db.exec(`
        CREATE TABLE IF NOT EXISTS ${TABLE_NAME} ( 
            id TEXT,
            name TEXT
        )
    `);
}

const add_playlist = async ({ id, name }) => 
{
    if(await playlist_exists({ name }))
    {
        // Skip
        return;
    }

    const db = await dbm.get_handle();

    await db.run(`
        INSERT INTO ${TABLE_NAME} ( id, name )
        VALUES ('${id}', '${name}')
    `);
}

const get_playlist_by_name = async ({ name }) => 
{
    const db = await dbm.get_handle();

    const playlist = await db.get(`
        SELECT * FROM ${TABLE_NAME} 
        WHERE name='${name}'
    `);

    return playlist;
}

const playlist_exists = async ({ name }) => 
{
    const playlist = await get_playlist_by_name({ name });

    return playlist ? true : false;
}

module.exports = {
    init,
    create,
    add_playlist,
    get_playlist_by_name
}