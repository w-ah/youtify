// 3rd party includes
require('dotenv').config(); // set env vars from .env file

// includes
const youtify = require('./core/youtify_main');

const main = async () => 
{
    console.log("Starting...");

    await youtify.start();

    console.log("Exiting...");
    process.exit(0);
}

main();