import Validator from './validator';

/**
 * Cards Validator Class
 */
export default class CardsValidator extends Validator {
    /**
     * @returns { Array }
     */
    store() {
        this.checkBody('card_token', this.__('Required %s', 'card_token')).notEmpty();
        return this.validationErrors() || [];
    }
}