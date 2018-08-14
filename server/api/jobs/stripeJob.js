import BaseJob from './baseJob';
import _ from 'lodash';

export default class StripeJob extends BaseJob {
    /**
     * StripePaymentJob constructor.
     * 
     * @param { StripeHelper } stripeConfig 
     * @param { Number } price 
     */
    constructor(stripe_customer_id, type, data = {}) {
        super(_.assign({}, { stripe_customer_id, type }, { ...data }));
    }

    handler() {
        this.queue.create(`stripe ${this.data.type}`, this.data).priority('high').removeOnComplete(true).attempts(3).save();
    }
}