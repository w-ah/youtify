// 3rd party includes
const fs = require('fs');
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');

// includes
const { DB_DATA_DIR, DB_DATA_FILE } = require('../constants');

let DB = null;

const init = async () => 
{
    fs.mkdirSync(DB_DATA_DIR, { recursive: true });

    // open the database
    DB = await sqlite.open({
        filename: DB_DATA_FILE,
        driver: sqlite3.cached.Database
    });
}

const init_guard = async () => 
{
    if(!DB)
    {
        await init();
    }
}

const get_handle = async () => 
{
    await init_guard();

    return DB;
}

module.exports = {
    init,
    get_handle
};