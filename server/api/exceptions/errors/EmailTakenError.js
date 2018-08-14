import ApiError from './ApiError';
import { codes, statuses } from '../../errors/errors';

/**
 * EmailTakenError
 */
export default class extends ApiError {
	constructor(__) {
		super(__('EmailTaken'), statuses.CONFLICT, codes.DATABASE_ERROR);
	}
}