import { queue } from '../../server';

export default class BaseJob {
    constructor(data) {
        // Set queue.
        this.queue = queue;

        // Set data.
        this.data = data;

        // Handle job.
        this.handler();
    }

    handler() {
        throw new Error('You have to implement the method handler!');
    }
}
