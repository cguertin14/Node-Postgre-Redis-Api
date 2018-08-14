import ApiError from './ApiError';
import { codes, statuses } from '../../errors/errors';

/**
 * InternalError
 */
export default class extends ApiError {
	constructor(__, message) {
		super(message || __('InvalidData'), statuses.NOT_ACCEPTABLE, codes.UNACCEPTABLE_CONTENT_ERROR);
	}
}