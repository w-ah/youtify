// 3rd party includes
const path = require('path');
const fs = require('fs');
const yml = require('js-yaml');

// includes
const store = require('./store');

const CONFIG_PATH = path.resolve(__dirname, '../config.yml')

const load = () => 
{
    const configJSON = get_config();
    store.config = { ...store.config, ...configJSON };
}

const get_config = () => 
{
    const fileStr = fs.readFileSync(CONFIG_PATH).toString();
    const json = yml.load(fileStr);

    return json;
}

module.exports = {
    load
}