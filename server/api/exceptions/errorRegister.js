import ApiError from './errors/ApiError';
import InternalError from './errors/InternalError';
import NotAcceptableError from './errors/NotAcceptableError';
import NotFoundError from './errors/NotFoundError';

/**
 * Glogal error handler
 */
export const errorHandler = (err, req, res, next) => {
	// TODO: Remove logging of error in production.
	console.error(err);
	
	// Defined error.
	if (err instanceof ApiError) {
		const { code, message } = err;
		return res.status(err.status).json({
			error: { code, message }
		});
	}
    
	// Invalid data error.
	if (err.name === 'ValidationError') {
		// Default error.
		const { code, message, status } = new NotAcceptableError(res.__);
		return res.status(status).json({
			error: { code, message }
		});
	}

	// NotFoundError
	if (err.name === 'CastError') {
		// Default error.
		const whatIsNotFound = err.message.substring(err.message.indexOf('model') + 6, err.message.length).replace(/[^a-zA-Z ]/g, ""); 
		const { code, message, status } = new NotFoundError(res.__, whatIsNotFound);
		return res.status(status).json({
			error: { code, message }
		});
	}

	// Default error.
	const { code, message, status } = new InternalError(res.__);
	return res.status(status).json({
		error: { code, message }
	});
};