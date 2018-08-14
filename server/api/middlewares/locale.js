/**
 * Middleware for every route, for locale.
 */
export default (req, res, next) => {
    const locale = req.cookies['locale'];
    if (locale) req.setLocale(locale);
    next();
};