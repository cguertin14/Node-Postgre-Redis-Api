import { Types } from 'mongoose';
import customValidator from 'express-validator';
import validator from 'validator';
import moment from 'moment';
import util from 'util';
import countries from './json/countries.json';

export default customValidator({
    customValidators: {
        isIdValid(value, id) {
            return value.match(/^[0-9a-fA-F]{24}$/) &&
                   Types.ObjectId.isValid(value);
        },
        isShortDate(value, id) {
            return moment(value, 'YYYY-MM-DD').isValid();
        },
        isLongDate(value, id) {
            return moment(value, 'YYYY-MM-DD HH:mm:ss').isValid();
        },
        isDateGtToday(value, id) {
            return moment(value).isAfter(moment().valueOf());
        },
        isDateLtToday(value, id) {
            return moment(value).isBefore(moment().valueOf());
        },
        isDistinct(value, id) {
            if (!(value instanceof Array)) return false;
            return (new Set(value)).size === value.length
        },
        isValidCountry(value, id) {
            return countries.map(c => c.name).includes(value);
        }
    }
});