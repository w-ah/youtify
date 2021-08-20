// 3rd party includes
const cp = require('child_process');

// includes
const store = require('./shared_store');

const run = async (cmdExpr, options) => 
{
    return new Promise(resolve => 
    {
        const cmdParts = cmdExpr.split(' ');
        const cmd = cmdParts[0];
        const cmdArgs = cmdParts.slice(1);
        const proc = cp.spawn(cmd, cmdArgs, { shell: options.shell });

        let { showOutput, returnOutput } = { showOutput: false, returnOutput: false, ...options };
        if(store.config.debug)
        {
            showOutput = true;
        }

        let buffer = "";

        proc.once('done', () => 
        {
            resolve(buffer);
        });
        proc.once('error', e => 
        {
            if(showOutput)
            {
                process.stdout.write(e.toString());
            }

            resolve();
        });
        proc.once('close', () => 
        {
            if(returnOutput)
            {
                resolve(buffer);
            }
            else 
            {
                resolve();
            }
        });

        proc.stdout.on('data', d => 
        {
            buffer += d.toString();

            if(showOutput)
            {
                process.stdout.write(d.toString());
            }
        });

        proc.stderr.on('data', d => 
        {
            if(showOutput)
            {
                process.stdout.write(d.toString());
            }
        })
    });
}

const run_shell = async (cmdExpr, options) => 
{
    return run(cmdExpr, { ...options, shell: true });
}

module.exports = {
    run,
    run_shell
}