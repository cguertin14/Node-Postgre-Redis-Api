import kue from 'kue';
import BaseJob from './baseJob';

export default class SendTextMessageJob extends BaseJob {
    constructor({ message, to }) {
        super({ message, to });
    }

    handler() {
        this.queue.create('sms', this.data).priority('high').removeOnComplete(true).attempts(3).save();
    }
}