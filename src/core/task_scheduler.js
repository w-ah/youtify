// 3rd party includes
const { Worker } = require('worker_threads');
const path = require('path');
const os = require('os');

// includes
const store = require('./shared_store');
const queue = require('./task_queue');
const youtify = require('./youtify_task');
const { wait_min, wait_s } = require('./utils/wait');

// Locals
const NUM_CPUS = os.cpus().length;

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
    switch(store.config.execMode)
    {
        case "sync": 
        {
            await process_queue_sync();
            break;
        }
        default: 
        {
            await process_queue_async();
        }
    }
}

const process_queue_sync = async () => 
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

            // Schedule next exec
            add({ ...task, exec_at: Date.now() + interval });
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
    }

    console.log("Finished processing queue");
}

const process_queue_async = async () => 
{
    const q_start_size = queue.size();

    // Start executing tasks at front of queue up to the number of available
    // cpu cores.
    // When a promise resolves, exec a new promise from teh front of the queue.
    // Repeat until queue is empty

    let running_worker_count = 0;

    do
    {
        await wait_s(1);

        if(queue.has_next())
        {
            const q_idx = q_start_size - queue.size();

            const available_workload = NUM_CPUS - running_worker_count;
            if(available_workload > 0)
            {
                const task = queue.dequeue();
                const { channel, interval } = task;

                console.log(`Running ${q_idx + 1} of ${q_start_size} queued tasks...`);

                new Promise(resolve => 
                {
                    const worker_path = path.resolve(__dirname, 'youtify_worker.js');
                    const worker = new Worker(worker_path, { workerData: { channel } });

                    worker.once("message", res => 
                    {   
                        const { err, status } = res;

                        if(status === "OK")
                        {
                            // Schedule next exec
                            add({ ...task, exec_at: Date.now() + interval });
                        }
                        else 
                        {
                            if(store.config.debug)
                            {
                                console.log(err);
                            }

                            // If there is an error, re-schedule the task
                            // TODO: Max retires? Retry backoff period?
                            console.log("Task error. Re-scheduling");
                            add(task);
                        }

                        --running_worker_count;
                        resolve();
                    });
                });

                ++running_worker_count;
            }
        }

        await wait_s(1);
    }
    while(running_worker_count > 0)

    console.log("Finished processing queue");
}

module.exports = {
    run,
    add
};
