const QUEUE = [];

const has_next = () => 
{
    return QUEUE.length > 0;
}

const size = () => 
{
    return QUEUE.length;
}

const enqueue = (task) => 
{
    QUEUE.push(task);
}

const dequeue = () => 
{
    const task = QUEUE.splice(0, 1)[0];
    return task;
}

module.exports = {
    has_next,
    size,
    enqueue,
    dequeue
}