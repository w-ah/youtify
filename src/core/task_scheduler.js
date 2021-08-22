// includes
const store = require('./shared_store');
const queue = require('./task_queue');
const youtify = require('./youtify_task');

const TASKS = [];

const run = async () => 
{
    while(true)
    {
        console.log("Moving tasks to queue...");
        move_tasks_to_queue();
        console.log("Processing task queue...")
        await process_queue();
        console.log("Waiting 1 min...");
        await pause(0.25);
    }
}

const add = ({ channel, exec_at, interval }) => 
{
    TASKS.push({ channel, exec_at, interval });
}

const move_tasks_to_queue = () => 
{
    const now = Date.now();
    const readyTasks = [];
    const unreadyTasks = TASKS.slice();

    for(let i = 0; i < TASKS.length; ++i)
    {
        const task = TASKS[i];
        if(task.exec_at < now)
        {
            readyTasks.push(task);
            unreadyTasks.splice(i, 1);
        }
    }

    TASKS.length = 0;
    TASKS.push(...unreadyTasks);

    readyTasks.forEach(t => queue.enqueue(t));
}

const process_queue = async () =>
{
    while(queue.has_next())
    {
        const task = queue.dequeue();
        const { channel, exec_at, interval } = task;

        // TODO: Run tasks in parallel depending on number of CPU cores available
        // add as config option
        try 
        {
            await youtify.run({ channel });
        }
        catch(e)
        {
            if(store.config.debug)
            {
                console.log(e);
            }

            // If there is an error, add the task to the queue again to be 
            // re-processed immediately
            // TODO: Max retires? Retry backoff perid?
            queue.enqueue(task);
        }

        // Schedule next exec
        add({ ...task, exec_at: exec_at + interval });
    }
}

const pause = async (mins) => 
{
    return new Promise(resolve => setTimeout(resolve, mins * 60 * 1000));
}

module.exports = {
    run,
    add
};
