import Validator from './validator';

/**
 * Facebook Validator Class
 */
export default class FacebookValidator extends Validator {
    /**
     * Facebook login validator.
     * @returns { Array }
     */
    login() {
        this.checkBody('access_token', this.__('Required %s', 'Access Token')).notEmpty();
        return this.req.validationErrors() || [];
    }

    /**
     * Facebook SignUp validator.
     * @returns { Array }
     */
    signUp() {
        this.checkBody('access_token', this.__('Required %s', 'Access Token')).notEmpty();
        return this.req.validationErrors() || [];
    }

    /**
     * Facebook link account validator.
     * @returns { Array }
     */
    linkAccount() {
        this.checkBody('fb_access_token', this.__('Required %s', 'Facebook Access Token')).notEmpty();
        return this.req.validationErrors() || [];
    }
}