import _ from 'lodash';
import jwt from 'jsonwebtoken';
import { ExtractJwt } from 'passport-jwt/lib';
import bcrypt from 'bcryptjs';
import BaseController from './baseController';
import UserValidator from '../validators/users';
import { codes, statuses, error } from '../errors/errors';
import { User } from '../models/User';
import { DeviceToken } from '../models/DeviceToken';
import { blacklistToken, setTokens, tokenValidation } from '../../utils/tokens';
import InvalidTokenError from '../exceptions/errors/InvalidTokenError';
import EmailTakenError from '../exceptions/errors/EmailTakenError';

export default class UserController extends BaseController {
	_init() {
		this.validator = new UserValidator(this);
	}

	async signUp() {
		const errors = this.validator.signUp();
		if (errors.length > 0) {
			return this.res.status(statuses.NOT_ACCEPTABLE).json({ errors });
		}

		// Unique email validation
		if (await User.findOne({ email: this.req.body.email })) {
			throw new EmailTakenError(this.__);
		}

		// Create User
		const user = await User.create({
			..._.pick(this.req.body, ['email','password','gender','phoneNumber','firstName','lastName','birthdate']),
			locale: this.req.cookies.locale || 'en'
		});
		// Create stripe customer
		await user.createCustomer();
		// Set tokens
        const { token, refreshToken } = setTokens(user, this.res);
        
		return this.res.status(statuses.CREATED_OR_UPDATED).json({ user, token, refreshToken });
	}

	async me() {
		return this.res.json({ user: await this.getUser() });
	}

	async logOut() {
		try {
			// Remove device token.
			const { deviceToken } = this.req.body;
			if (deviceToken)
				await DeviceToken.findOneAndRemove({ user: this.user.id, token: deviceToken });

			await blacklistToken(this.req);
			this.req.logOut();
			this.req.session.destroy();
			return this.res.json({ status: this.__('LoggedOut') });
		} catch (e) {
			return this.res.status(statuses.NOT_ACCEPTABLE).json(
				error(codes.UNACCEPTABLE_CONTENT_ERROR, this.__('LogoutFailed'))
			);
		}
	}

	async verifyEmail() {
		const errors = this.validator.verifyEmail();
		if (errors.length > 0)
			return this.res.status(statuses.NOT_ACCEPTABLE).json({ errors });

		let user = await User.findOne({ email: this.req.body.email });
		if (!user) return this.res.json({ status: this.__('EmailAvailable') });
		throw new EmailTakenError(this.__);
	}

	async setLocale(locale) {
		if (!locale) {
			return this.res.status(statuses.NOT_ACCEPTABLE).json(
				error(codes.UNACCEPTABLE_CONTENT_ERROR, this.__('LocaleRequired'))
			);
		}

		if (locale === 'fr' || locale === 'en') {
			this.res.setLocale(locale);
			this.res.cookie('locale', locale, { maxAge: 9999999000, httpOnly: true });
			return this.res.json({ status: this.__('LocaleChanged %s', locale) });
		} else {
			return this.res.status(statuses.NOT_ACCEPTABLE).json(
				error(codes.UNACCEPTABLE_CONTENT_ERROR, 'Locale must be either fr or en.')
			);
		}
	}

	async registerDevice() {
		const errors = this.validator.registerDevice();
		if (errors.length > 0)
			return this.res.status(statuses.NOT_ACCEPTABLE).json({ errors });

		const payload = _.pick(this.req.body, ['token', 'platform']);
		if (await DeviceToken.findOne({ user: this.user.id, ...payload }))
			return this.res.json({ status: this.__('DeviceTokenExists') });

		// Create new device token.
		await DeviceToken.create({ user: this.user.id, ...payload });
		return this.res.status(statuses.CREATED_OR_UPDATED).json({ status: this.__('DeviceRegistered') });
	}

	async search(value) {
		const pattern = new RegExp(decodeURI(value), 'i');

		let users = (await User.aggregate()
			.project({ fullName: { $concat: ['$firstName', ' ', '$lastName'] } })
			.match({ fullName: pattern })).map(item => ({ _id: item._id }));
		users = await User.find({ _id: { $in: users } }).where('_id').ne(this.user.id)
			.where('_id').nin(this.user.friendInvites.map(f => f._id.toString()).concat(this.user.friends.map(f => f._id.toString())))
			.select('_id firstName lastName profileImageUrl friendInvites').cache();

		// Filter users and add status of invite (pending or not)
		users = users.map(u => {
			u.inviteStatus = u.friendInvites.find(fi => fi.toString() === this.user.id.toString()) ? 'Pending' : 'Not Sent';
			return _.pick(u, ['_id', 'firstName', 'lastName', 'profileImageUrl', 'inviteStatus']);
		});

		return this.res.json({ users });
	}

	async searchSuggestions() {
		let users = await User.findRandom({}).where('_id').ne(this.user.id)
			.where('_id').nin(this.user.friendInvites.map(f => f._id).concat(this.user.friends.map(f => f._id)))
			.select('_id firstName lastName profileImageUrl friendInvites').limit(10).cache();

		// Filter users and add status of invite (pending or not)
		users = users.map(u => {
			u.inviteStatus = u.friendInvites.find(fi => fi.toString() === this.user.id.toString()) ? 'Pending' : 'Not Sent';
			return _.pick(u, ['_id', 'firstName', 'lastName', 'profileImageUrl', 'inviteStatus']);
		});

		return this.res.json({ users });
	}

	async edit() {
		const errors = this.validator.edit();
		if (errors.length > 0)
			return this.res.status(statuses.NOT_ACCEPTABLE).json({ errors });

		// Get new data from body.
		const body = _.pick(this.req.body, [
			'firstName', 'lastName', 'phoneNumber', 'gender', 'birthdate',
			'country', 'profileImageUrl'
		]);

		// Edit user's properties.
		Object.keys(body).forEach(key => this.user[key] = body[key]);
		await this.user.save();

		// Redirect response to get current user.
		return this.res.json({ user: await this.getUser() });
	}

	async validatePassword() {
		return await bcrypt.compare(this.req.body.password, this.user.password);
	}

	async changePassword() {
		const errors = this.validator.changePassword();
		if (errors.length > 0)
			return this.res.status(statuses.NOT_ACCEPTABLE).json({ errors });

		// Validate Password.
		if (!await this.validatePassword()) {
			return this.res.status(statuses.UNAUTHORIZED).json(
				error(codes.UNACCEPTABLE_CONTENT_ERROR, this.__('WrongPassword'))
			);
		}

		const user = this.user,
			{ newPassword } = this.req.body;

		const isNotDifferent = await bcrypt.compare(newPassword, user.password);
		if (isNotDifferent) {
			return this.res.status(statuses.CONFLICT).json(
				error(codes.UNACCEPTABLE_CONTENT_ERROR, this.__('PasswordHasntChanged'))
			);
		}

		// Update user's password.       
		user.password = newPassword;
		await user.save();

		return this.res.status(statuses.CREATED_OR_UPDATED).json({ status: this.__('Updated %s', 'Password') });
	}

	async changeEmail() {
		const errors = this.validator.changeEmail();
		if (errors.length > 0)
			return this.res.status(statuses.NOT_ACCEPTABLE).json({ errors });

		// Validate Password.
		if (!(await this.validatePassword())) {
			return this.res.status(statuses.UNAUTHORIZED).json(
				error(codes.UNACCEPTABLE_CONTENT_ERROR, this.__('WrongPassword'))
			);
		}

		const user = this.user,
			{ newEmail } = this.req.body;

		// Check that new email is different than actual email
		if (await User.findOne({ email: newEmail })) {
			throw new EmailTakenError(this.__);
		}

		// Update user's email.       
		user.email = newEmail;
		await user.save();

		return this.res.status(statuses.CREATED_OR_UPDATED).json({ status: this.__('Updated %s', 'Email') });
	}

	async validateToken() {
		try {
			const token = ExtractJwt.fromAuthHeaderAsBearerToken()(this.req);
			jwt.verify(token, process.env.JWT_SECRET);
			return this.res.json({ status: 'Token is valid!' });
		} catch (e) {
			return tokenValidation(e, this.res);
		}
	}

	async refreshToken() {
		// Extract refresh token from body.
		const oldRefreshToken = ExtractJwt.fromAuthHeaderAsBearerToken()(this.req);

		try {
			// Decode refresh token.
			const decoded = jwt.verify(oldRefreshToken, this.req.cookies.JWT_REFRESH);
			// Invalidate Refresh Token (by replacing secret refreshing key).
			const user = await User.findById(decoded._id);
			const { token, refreshToken } = setTokens(user, this.res);
			return this.res.json({ token, refreshToken });
		} catch (e) {
			throw new InvalidTokenError(this.__);
		}
	}
}