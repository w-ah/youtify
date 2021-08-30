// 3rd party includes
const fs = require('fs');
const Database = require('better-sqlite3');

// includes
const { DB_DATA_DIR, DB_DATA_FILE } = require('../constants');

let DB = null;

const init = async () => 
{
    fs.mkdirSync(DB_DATA_DIR, { recursive: true });

    // open the database
    DB = new Database(DB_DATA_FILE);
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