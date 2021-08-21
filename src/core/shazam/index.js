// 3rd party includes
const fs = require('fs');
const path = require('path');

// incudes
const proc = require('../proc');
const store = require('../shared_store');

const PY_SCRIPT_TEMPLATE = path.resolve(__dirname, 'recognize_song.py');
const PY_SCRIPT = path.resolve(__dirname, 'script.py');

const recognize_song = async (file) => 
{
    prepare_python_script(file);

    const cmdExp = `python ${PY_SCRIPT}`;

    const out = await proc.run_shell(cmdExp, { returnOutput: true });

    try 
    {
        const json = JSON.parse(out);
        return json;
    } 
    catch(e)
    {
        if(store.config.debug)
        {
            console.log(e);
        }
        
        return {
            matches: []
        };
    }
}

const prepare_python_script = (file) => 
{
    let scriptString = fs.readFileSync(PY_SCRIPT_TEMPLATE).toString();
    scriptString = scriptString.replace('#!OGG_FILE', file);

    fs.writeFileSync(PY_SCRIPT, scriptString);
}

module.exports = {
    recognize_song
};