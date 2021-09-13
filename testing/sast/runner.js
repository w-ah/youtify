// 3rd party includes
const cp = require('child_process');
const path = require('path');

const main = async () => 
{
    // Install deps
    cp.execSync("pip install njsscan", { stdio: 'ignore' });

    // Run
    const src_path = path.resolve(__dirname, '../../src');
    cp.execSync(`njsscan ${src_path} --config .njsscan.yml`, { stdio: 'inherit' });
}

main();