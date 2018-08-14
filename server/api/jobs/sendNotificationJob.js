import BaseJob from './baseJob';

export default class SendNotificationJob extends BaseJob {
    /**
     * Send Notification Job constructor. 
     */
    constructor({ title, body, receiver, data, sender, type }) {
        super({ 
            title,
            body,
            receiver,
            sender,
            type,
            data
        });
    }

    handler() {
        this.queue.create('sendNotification', this.data).priority('high').removeOnComplete(true).attempts(3).save();
    }
}