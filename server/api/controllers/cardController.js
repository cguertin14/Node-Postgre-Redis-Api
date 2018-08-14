import BaseController from './baseController';
import StripeHelper from '../../config/payments/StripeHelper';
import { statuses } from '../errors/errors';
import CardsValidator from '../validators/cards';
import NotFoundError from '../exceptions/errors/NotFoundError';
import _ from 'lodash';

export default class CardController extends BaseController {
	async _init() {
		this.stripe = new StripeHelper(this.user.stripe_customer_id);
		this.validator = new CardsValidator(this);
	}

	async index() {
		let cards = await this.stripe.cards();
		const { defaultCard } = this.user;
		if (defaultCard) {
			cards = cards.data.map(c => _.assign({}, c, { default: c.id === defaultCard }));
		}
		return this.res.json({ cards });
	}
	async store() {
		const errors = this.validator.store();
		if (errors.length > 0)
			return this.res.status(statuses.NOT_ACCEPTABLE).json({ errors });

		const card = await this.stripe.createCard(this.req.body.card_token);
		return this.res.status(statuses.CREATED_OR_UPDATED).json({ card });
	}

	async get(id) {
		try {
			// Validate card.
			const card = await this.stripe.getCard(id);
			return this.res.json({ card });
		} catch (e) {
			throw new NotFoundError(this.__, 'Card');
		}
	}

	async remove(id) {
		try {
			const result = await this.stripe.deleteCard(id);
			if (this.user.defaultCard === id) {
				this.user.defaultCard = undefined;
				await this.user.save();
			}
			return this.res.json({ result });
		} catch (e) {
			// Card is invalid.
			throw new NotFoundError(this.__, 'Card');
		}
	}

	async setDefaultCard(id) {
		try {
			// Validate card.
			await this.stripe.setDefaultCard(id);
		} catch (e) {
			// Card is invalid.
			throw new NotFoundError(this.__, 'Card');
		}

		// Set default card.
		this.user.defaultCard = id;
		await this.user.save();

		// Return response to client.
		return this.res.status(statuses.CREATED_OR_UPDATED).json({
			status: this.__('DefaultCard')
		});
	}
}