import Validator from './validator';
import validator from 'validator';

/**
 * User Validator Class.
 */
export default class UserValidator extends Validator {
    /**
     * @returns { Array }
     */
    signUp() {
        this.checkBody('email', this.__('Required %s', 'Email')).notEmpty();
        this.checkBody('email', this.__('Email')).trim().isEmail().normalizeEmail();
        this.checkBody('password', this.__('Required %s', 'Password')).notEmpty();
        this.checkBody('firstName', this.__('Required %s', 'Firstname')).notEmpty();
        this.checkBody('lastName', this.__('Required %s', 'Lastname')).notEmpty();
        this.checkBody('gender', this.__('Required %s', 'Gender')).notEmpty();
        if (this.req.body.gender !== undefined) {
            this.checkBody('gender', this.__('InvalidGender')).custom(value => /\b(male|female|other)\b/.test(value));
        }
        if (this.req.body.password !== undefined) {
            this.checkBody('password', this.__('PasswordLength %s', 'password')).custom(password => password.length >= 6);
        }
        if (this.req.body.birthdate !== undefined) {
            this.checkBody('birthdate', this.__('Required %s', 'birthdate')).notEmpty();
            this.checkBody('birthdate', this.__('InvalidFormat %s', 'birthdate')).isShortDate();
            this.checkBody('birthdate', this.__('InvalidPreviousDate %s', 'birthdate')).isDateLtToday();
        }
        return this.req.validationErrors() || [];
    }

    /**
     * @returns { Array }
     */
    login() {
        this.checkBody('email', this.__('Required %s', 'Email')).notEmpty();
        this.checkBody('password', this.__('Required %s', 'Password')).notEmpty();
        return this.req.validationErrors() || [];
    }

    /**
     * @returns { Array }
     */
    verifyEmail() {
        this.checkBody('email', this.__('Required %s', 'Email')).notEmpty();
        this.checkBody('email', this.__('EmailMustBeValid')).trim().isEmail().normalizeEmail();
        return this.req.validationErrors() || [];
    }

    /**
     * @returns { Array }
     */
    registerDevice() {
        this.checkBody('platform', this.__('Required %s', 'platform')).notEmpty();
        this.checkBody('platform', this.__('InvalidDevice')).custom(value => /\b(android|ios)\b/.test(value));
        this.checkBody('token', this.__('Required %s', 'token')).notEmpty();
        return this.req.validationErrors() || [];
    }

    /**
     * @returns { Array }
     */
    changeEmail() {
        this.checkBody('password', this.__('Required %s', 'password')).notEmpty();
        this.checkBody('newEmail', this.__('Required %s', 'newEmail')).notEmpty();
        if (this.req.body.newEmail !== undefined) {
            this.checkBody('newEmail', this.__('InvalidFormat %s', 'newEmail')).custom(email => validator.isEmail(email));
        }
        return this.validationErrors() || [];
    }

    /**
     * @returns { Array }
     */
    changePassword() {
        this.checkBody('password', this.__('Required %s', 'password')).notEmpty();
        this.checkBody('newPassword', this.__('Required %s', 'newPassword')).notEmpty();
        if (this.req.body.newPassword !== undefined) {
            this.checkBody('newPassword', this.__('PasswordLength %s', 'newPassword')).custom(password => password.length >= 6);
        }
        return this.validationErrors() || [];
    }

    /**
     * @returns { Array }
     */
    edit() {
        const {
            firstName, lastName, gender, birthdate,
            country, profileImageUrl
        } = this.req.body;

        if (firstName !== undefined) {
            this.checkBody('firstName', this.__('Required %s', 'firstName')).notEmpty();
        }
        if (lastName !== undefined) {
            this.checkBody('lastName', this.__('Required %s', 'lastName')).notEmpty();
        }
        if (gender !== undefined) {
            this.checkBody('gender', this.__('Required %s', 'gender')).notEmpty();
            this.checkBody('gender', this.__('InvalidGender')).custom(value => /\b(male|female|other)\b/.test(value));
        }
        if (country !== undefined) {
            this.checkBody('country', this.__('Required %s', 'country')).notEmpty();
            this.checkBody('country', this.__('InvalidCountry')).isValidCountry();
        }
        if (profileImageUrl !== undefined) {
            this.checkBody('profileImageUrl', this.__('Required %s', 'profileImageUrl')).notEmpty();
            this.checkBody('profileImageUrl', this.__('InvalidUrl')).custom(value => validator.isURL(value));
        }
        if (birthdate !== undefined) {
            this.checkBody('birthdate', this.__('Required %s', 'birthdate')).notEmpty();
            this.checkBody('birthdate', this.__('InvalidFormat %s', 'birthdate')).isShortDate();
            this.checkBody('birthdate', this.__('InvalidDate %s', 'birthdate')).isDateLtToday();
        }
        return this.validationErrors() || [];
    }
}