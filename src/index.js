// 3rd party includes
require('dotenv').config(); // set env vars from .env file

// includes
const init = require('./core/init');

const main = async () => 
{
    console.log("Starting...");

    await init();

    console.log("Exiting...");
    process.exit(0);
}

main();