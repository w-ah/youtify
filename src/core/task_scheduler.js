// includes
const store = require('./shared_store');
const queue = require('./task_queue');
const youtify = require('./youtify_task');
const { wait_min } = require('./utils/wait');

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
        await wait_min(1);
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
            readyTasks.push(unreadyTasks.shift())
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
        const { channel, interval } = task;

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
            // TODO: Max retires? Retry backoff period?
            console.log("Task error. Re-scheduling");
            add(task);
        }

        // Schedule next exec
        add({ ...task, exec_at: Date.now() + interval });
    }

    console.log("Finished processing queue");
}

module.exports = {
    run,
    add
};
