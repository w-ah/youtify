// 3rd party includes
const cp = require('child_process');
const path = require('path');
const glob = require('glob');

const main = async () => 
{
    const report_dir = "corpus";
    const fuzz_scripts = glob.sync(`${__dirname}/*.fuzz.js`);

    console.log(`Running ${fuzz_scripts.length} tests...`);
    for(const [index, value] of fuzz_scripts.entries())
    {
        const rel = path.relative(__dirname, value);
        console.log(`(${index + 1}/${fuzz_scripts.length}) - ${rel}...`);
        try 
        {
            const out = cp.execSync(`npx jsfuzz ${rel} ${report_dir} --regression=true`, { stdio: 'inherit' }).toString();
            console.log(out);
        }
        catch(error)
        {
            console.error(error);
        }
    }

    // Generate Report

    console.log("Done");
}

main();