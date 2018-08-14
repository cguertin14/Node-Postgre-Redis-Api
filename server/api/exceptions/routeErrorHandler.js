/**
 * Global Error Handler for async functions.
 *
 * @param {*} fn
 */
export const catchAsyncErrors = fn => {
	return (req, res, next) => {
		const routePromise = fn(req, res, next);
		if (routePromise.catch) {
			routePromise.catch(err => next(err));
		}
	};
};
