const Queue =  class Queue 
{
    constructor()
    {
        this.QUEUE = [];
    }

    has_next = () => 
    {
        return this.QUEUE.length > 0;
    }

    size = () => 
    {
        return this.QUEUE.length;
    }

    enqueue = (d) => 
    {
        this.QUEUE.push(d);
    }

    dequeue = () => 
    {
        return this.QUEUE.splice(0, 1)[0];
    }
}

module.exports = Queue;