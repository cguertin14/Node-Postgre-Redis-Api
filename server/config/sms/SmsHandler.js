import { twilio } from '../json/services.json';

/**
 * SmsHandler class.
 */
export default class SmsHandler {
    constructor() {
        const { from, accountSid, authToken } = twilio[process.env.NODE_ENV];
        this.from = from;
        this.client = require('twilio')(accountSid, authToken);
    }

    send(body) {
        this.payload = { body, from: this.from };
        return this;
    }

    to(personToSendMessageTo) {
        try {
            return this.client.messages.create({ ...this.payload, to: personToSendMessageTo }) 
                       .then(() => {})
                       .done();
        } catch (e) {
            throw e;
        }
    }
}