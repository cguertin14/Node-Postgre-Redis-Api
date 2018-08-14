import Validator from './validator';

/**
 * Friends Validator Class
 */
export default class FriendsValidator extends Validator {
    /**
     * @returns { Array }
     */
    answer() {
        this.checkBody('status', this.__('Required %s', 'status')).notEmpty();
        this.checkBody('status', this.__('InvalidStatus')).custom(value => /\b(accepted|refused)\b/.test(value));
        return this.req.validationErrors() || [];
    }
}