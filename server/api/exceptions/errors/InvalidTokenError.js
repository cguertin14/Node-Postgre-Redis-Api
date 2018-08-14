import ApiError from './ApiError';
import { codes, statuses } from '../../errors/errors';

/**
 * InvalidTokenError
 */
export default class extends ApiError {
	constructor() {
		super('Refresh token has already been used.', statuses.NOT_ACCEPTABLE, codes.UNACCEPTABLE_CONTENT_ERROR);
	}
}