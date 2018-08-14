// All error codes
export const codes = {
	UNACCEPTABLE_CONTENT_ERROR: 1,
	INTERNAL_ERROR: 2,
	DATABASE_ERROR: 3
};

// All statuses
export const statuses = {
	OK: 200,
	CREATED_OR_UPDATED: 201,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	METHOD_NOT_ALLOWED: 405,
	NOT_ACCEPTABLE: 406,
	CONFLICT: 409,
	INTERNAL_SERVER_ERROR: 500
};

// Helper jsonError function
export const error = (code, message) => {
	return {
		error: { code, message }
	};
};
