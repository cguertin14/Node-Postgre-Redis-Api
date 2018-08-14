import ApiError from './ApiError';
import { codes, statuses } from '../../errors/errors';

/**
 * NotFoundError
 */
export default class extends ApiError {
	/**
     * NotFoundError constructor
     * 
     * @param {function} __ 
     * @param {String} whatIsNotFound 
     */
	constructor(__, whatIsNotFound) {
		super(__('NotFound %s', whatIsNotFound), statuses.NOT_FOUND, codes.UNACCEPTABLE_CONTENT_ERROR);
	}
}