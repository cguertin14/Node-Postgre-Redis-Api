import stripePackage, { StripeResource } from 'stripe';
import { stripe as config } from '../json/services.json';

/**
 * Stripe Helper class.
 */
export default class StripeHelper {
	constructor(id = null) {
		const stripe = config['development']; // TODO: change to [process.env.NODE_ENV];
		this.stripe = stripePackage(stripe.sk);
		this.customerId = id;
	}

	async asCustomer() {
		return await this.stripe.customers.retrieve(this.customerId);
	}

	async createCustomer(email) {
		return await this.stripe.customers.create({ email });
	}

	async cards() {
		return await this.stripe.customers.listCards(this.customerId);
	}

	async createCard(source) {
		return await this.stripe.customers.createSource(this.customerId, { source });
	}

	async getCard(cardId) {
		return await this.stripe.customers.retrieveCard(this.customerId, cardId);
	}

	async deleteCard(cardId) {
		return await this.stripe.customers.deleteCard(this.customerId, cardId);
	}

	async setDefaultCard(cardId) {
		return await this.stripe.customers.update(this.customerId, {
			default_source: cardId
		});
	}

	async createCharge({ amount, description, source }) {
		let data = { amount, description, source,	currency: 'cad'	};
		if (source.substring(0,3) !== 'tok')
			data.customer = this.customerId;
		return await this.stripe.charges.create(data);
	}
}