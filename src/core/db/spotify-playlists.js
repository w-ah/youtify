const db = require('./manager');

const TABLE_NAME = "spotify_playlists";

const init = async () => 
{
    await create();
}

const create = async () => 
{
    const dbh = await db.get_handle();

    await dbh.exec(`
        CREATE TABLE IF NOT EXISTS ${TABLE_NAME} ( 
            id TEXT,
            name TEXT
        )
    `);
}

const add_playlist = async ({ id, name }) => 
{
    const dbh = await db.get_handle();

    await dbh.exec(`
        INSERT INTO ${TABLE_NAME} ( id, name )
        VALUES ('${id}', '${name}')
    `);
}

module.exports = {
    init,
    create,
    add_playlist
}