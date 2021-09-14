// includes
const Queue = require('./../../src/core/task_queue');

describe('Queue', () => 
{
    describe('#hasNext', () => 
    {
        test('should check empty queue', () => 
        {
            const queue = new Queue();
            expect(queue.has_next()).toEqual(false);
        });

        test('should check queue with items', () => 
        {
            const queue = new Queue();
            queue.enqueue('something');
            expect(queue.has_next()).toEqual(true);
        });
    });

    describe('#size', () => 
    {
        test('should get empty queue size', () => 
        {
            const queue = new Queue();
            expect(queue.size()).toEqual(0);
        });

        test('should get non-empty queue size', () => 
        {
            const queue = new Queue();
            queue.enqueue('something');
            expect(queue.size()).toEqual(1);
        });
    });

    describe('#enqueue, #dequeue', () => 
    {
        test('should add to back of queue', () => 
        {
            const queue = new Queue();

            queue.enqueue('something1');
            queue.enqueue('something2');
            queue.enqueue('something3');

            const val1 = queue.dequeue();
            const val2 = queue.dequeue();
            const val3 = queue.dequeue();

            expect(val1).toEqual('something1');
            expect(val2).toEqual('something2');
            expect(val3).toEqual('something3');
            expect(queue.size()).toEqual(0);
            expect(queue.has_next()).toEqual(false);
        });
    });

    describe('#dequeue', () => 
    {
        test('should remove and return front of queue', () => 
        {
            const queue = new Queue();

            queue.enqueue('something1');
            queue.enqueue('something2');
            queue.enqueue('something3');

            const val1 = queue.dequeue();
            const val2 = queue.dequeue();
            const val3 = queue.dequeue();

            expect(val1).toEqual('something1');
            expect(val2).toEqual('something2');
            expect(val3).toEqual('something3');
            expect(queue.size()).toEqual(0);
            expect(queue.has_next()).toEqual(false);
        });
    });
});