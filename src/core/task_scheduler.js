const queue = require('./task_queue');
const youtify = require('./youtify_task');

const run = async () => 
{
    while(true)
    {
        while(queue.has_next())
        {
            const task = queue.dequeue();
            const { channel } = task;

            await youtify.run({ channel });
        }
    }
}

const add = ({ channel }) => 
{
    queue.enqueue({ channel })
}

module.exports = {
    run,
    add
};
