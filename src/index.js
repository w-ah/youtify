const youtify = require('./core/youtify_main');

const main = async () => 
{
    console.log("Starting...");

    await youtify.start();

    console.log("Exiting...");
}

main();