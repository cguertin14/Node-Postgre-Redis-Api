// Imports.
import './config/config';
import './config/passport';
import './db/sequelize';
import './config/i18n';
import './config/cache';
import express from 'express';
import passport from 'passport/lib';

// Express config.
const port = process.env.PORT || 3000;
const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

// Express plugins.
app.use(require('helmet')());
app.use(express.static('public'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true, limit: '50mb' }));
app.use(require('cors')());
app.use(require('express-validator')());
app.use(require('./config/express-validator').default);
app.use(require('i18n').init);
app.use(require('./api/middlewares/locale').default);
app.use(require('./config/rateLimiter').default);
app.use(require('./config/session').default);
app.use(passport.initialize());
app.use(passport.session());

// Routes.
require('./api/routes/router').default(app);

// Global error handler.
app.use(require('./api/exceptions/errorRegister').errorHandler);

// Listener.
export const server = app.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});

export const queue = require('kue').createQueue({
	redis: process.env.REDISCLOUD_URL || 'redis://redis:6379'
});

export { app };