// includes
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
        await pause(1);
    }
}

const add = ({ channel, exec_at }) => 
{
    TASKS.push({ channel, exec_at });
}

const move_tasks_to_queue = () => 
{
    const now = Date.now();
    const taskSlice = TASKS.slice();

    const readyTasks = [];

    for(let i = 0; i < TASKS.length; ++i)
    {
        const task = TASKS[i];
        if(task.exec_at < now)
        {
            readyTasks.push(task);
            taskSlice.splice(0, 1);
        }
    }

    TASKS.length = 0;
    TASKS.push(...taskSlice);

    readyTasks.forEach(t => queue.enqueue(t));
}

const process_queue = async () =>
{
    while(queue.has_next())
    {
        const task = queue.dequeue();
        const { channel } = task;

        await youtify.run({ channel });
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
