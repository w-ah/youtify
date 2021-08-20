const cp = require('child_process');

const main = async () => 
{
    console.log("Starting build...");

    // install externals
    console.log("Installing Externals...");
    await new Promise(resolve => 
    {
        const cmdExpr = 'sh ./build_scripts/install.sh';
        const cmdParts = cmdExpr.split(' ');
        const cmd = cmdParts[0];
        const cmdArgs = cmdParts.slice(1);
        const proc = cp.spawn(cmd, cmdArgs);

        proc.once('exit', resolve);
        proc.once('done', resolve);
        proc.once('error', resolve);
        proc.once('close', resolve);

        proc.stdout.on('data', d => 
        {
            process.stdout.write(' > ' + d.toString());
        });

        proc.stderr.on('data', d => 
        {
            process.stdout.write(' > ' + d.toString());
        })
    });

    // do anything else here

    console.log("Done");
}

main();