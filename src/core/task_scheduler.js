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

    readyTasks.forEach(queue.enqueue);
}

const process_queue = async () =>
{
    const q_start_size = queue.size();

    while(queue.has_next())
    {
        const task = queue.dequeue();
        const { channel, exec_at, interval } = task;

        // TODO: Run tasks in parallel depending on number of CPU cores available
        // add as config option
        try 
        {
            console.log(`Running ${q_start_size - queue.size()} of ${q_start_size} queued tasks...`);
            await youtify.run({ channel });
        }
        catch(e)
        {
            if(store.config.debug)
            {
                console.log(e);
            }

            // If there is an error, re-schedule the task
            // TODO: Max retires? Retry backoff perid?
            console.log("Task error. Re-scheduling");
            add(task);
        }

        // Schedule next exec
        add({ ...task, exec_at: exec_at + interval });
    }

    console.log("Finished processing queue");
}

const pause = async (mins) => 
{
    return new Promise(resolve => setTimeout(resolve, mins * 60 * 1000));
}

module.exports = {
    run,
    add
};
