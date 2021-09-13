// 3rd party includes
const path = require('path');

// includes
const default_config = require('./default_config');

const paths = {
    ssl: path.resolve(__dirname, '../ssl'),
    config: path.resolve(__dirname, '../config')
}

const store = {
    config: default_config,
    paths
};

module.exports = store;