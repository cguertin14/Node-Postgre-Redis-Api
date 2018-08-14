import _ from 'lodash';
import { FB } from 'fb';
import { User } from '../models/User';
import BaseController from './baseController';
import FacebookValidator from '../validators/facebook';
import { statuses, codes, error } from '../errors/errors';
import { setTokens } from '../../utils/tokens';
import NotFoundError from '../exceptions/errors/NotFoundError';
import FacebookError from '../exceptions/errors/FacebookError';

export default class FacebookController extends BaseController {
	_init() {
		this.config = JSON.parse(process.env.FB);
		this.validator = new FacebookValidator(this);
		FB.options(this.config);
	}

	async login() {
		const errors = this.validator.login();
		if (errors.length > 0)
			return this.res.status(statuses.NOT_ACCEPTABLE).json({ errors });

		FB.setAccessToken(this.req.body.access_token);
		const res = await FB.api('me?fields=id,email', 'get'); //, async res => {
		if (res.error) throw new FacebookError(this.__);
		if (res) {
			let user = await User.findOne({ facebookId: res.id, email: res.email }).populate({ path: 'friends', select: 'firstName lastName imageUrl' });
			if (user) {
				// Set locale
				const { locale } = this.req.cookies;
				if (locale) {
					if (user.locale !== locale) {
						user.locale = locale;
						await user.save();
					}
				}
				const { token, refreshToken } = setTokens(user, this.res);
				return this.res.json({
					status: this.__('LoggedIn'),
					user,
					token,
					refreshToken
				});
			}

			throw new NotFoundError(this.__, 'User');
		}
		throw new FacebookError(this.__);
	}

	async signUp() {
		const errors = this.validator.signUp();
		if (errors.length > 0)
			return this.res.status(statuses.NOT_ACCEPTABLE).json({ errors });

		FB.setAccessToken(this.req.body.access_token);
		const res = await FB.api('me?fields=id,first_name,last_name,email,picture.width(400).height(400),gender', 'get');
		if (res.error) throw new FacebookError(this.__);
		if (res) {
			if (await User.findOne({ facebookId: res.id, email: res.email })) {
				return this.res.status(statuses.NOT_ACCEPTABLE).json(
					error(codes.UNACCEPTABLE_CONTENT_ERROR, this.__('Unique %s', 'Facebook User'))
				);
			}

			// Create user
			const user = await User.create({
				facebookId: res.id,
				email: res.email,
				firstName: res.first_name,
				lastName: res.last_name,
				gender: res.gender,
				profileImageUrl: res.picture.data.url
			});

			// Set tokens
			const { token, refreshToken } = setTokens(user, this.res);
			
			// Set locale
			const { locale } = this.req.cookies;
			if (locale) {
				if (user.locale !== locale) {
					user.locale = locale;
					await user.save();
				}
			}

			return this.res.status(statuses.CREATED_OR_UPDATED).json({
				status: this.__('LoggedIn'),
				user,
				token,
				refreshToken
			});
		}
		throw new FacebookError(this.__);
	}

	async linkAccount() {
		const errors = this.validator.linkAccount();
		if (errors.length > 0)
			return this.res.status(statuses.NOT_ACCEPTABLE).json({ errors });

		FB.setAccessToken(this.req.body.fb_access_token);
		const res = await FB.api('me?fields=id', 'get');
		if (res.error) throw new FacebookError(this.__);
		if (res) {
			if (await User.findOne({ facebookId: res.id })) {
				return this.res.status(statuses.NOT_ACCEPTABLE).json(
					error(codes.UNACCEPTABLE_CONTENT_ERROR, this.__('Unique %s', 'Facebook User'))
				);
			}

			this.user.facebookId = res.id;
			await this.user.save();
			return this.res.status(statuses.CREATED_OR_UPDATED).json({
				status: this.__('FBLinked')
			});
		}
		throw new FacebookError(this.__)();
	}
}