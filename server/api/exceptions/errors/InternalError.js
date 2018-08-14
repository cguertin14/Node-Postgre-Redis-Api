import ApiError from './ApiError';
import { codes, statuses } from '../../errors/errors';

/**
 * InternalError
 */
export default class extends ApiError {
	constructor(__) {
		super(__('InternalError'), statuses.INTERNAL_SERVER_ERROR, codes.INTERNAL_ERROR);
	}
}