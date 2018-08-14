import _ from 'lodash';
import bcrypt from 'bcryptjs';
import moment from 'moment';
import mongoose from 'mongoose';
import findOrCreate from 'mongoose-findorcreate';
import uniqueValidator from 'mongoose-unique-validator';
import { baseConfig, dateConfig, refValidator, baseConfigUrl, countryConfig } from '../../utils/mongoose';
import StripeHelper from '../../config/payments/StripeHelper';
import { s3 } from '../../config/json/services.json';

const UserSchema = new mongoose.Schema({
	email: baseConfig(String, {
		minlength: 1,
		unique: true
	}),
	password: baseConfig(String, {
		minlength: 6,
		required: false
	}),
	firstName: baseConfig(String, {
		trim: true,
		minlength: 1,
	}),
	lastName: baseConfig(String, {
		trim: true,
		minlength: 1,
	}),
	isAdmin: baseConfig(Boolean, { default: false }),
	locale: baseConfig(String, { default: 'en' }),
	birthdate: dateConfig({ required: false }),
	gender: baseConfig(String, {
		validate: {
			validator(val) {
				return /\b(male|female|other)\b/.test(val);
			},
			message: '{VALUE} must be male, female or other.'
		}
	}),
	phoneNumber: {
		type: String,
		required: false,
		set: (val) => {
			if (val === null || val === '')
				return undefined;
			return val;
		}
	},
	country: countryConfig(),
	defaultCard: baseConfig(String, { required: false }),
	profileImageUrl: baseConfigUrl({ required: false, default: `${s3.url}/profile_default.png` }),
	facebookId: {
		type: String,
		required: false,
		default: null
	},
	stripe_customer_id: {
		type: String,
		required: false,
		default: null
	},
	friends: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		}
	],
	friendInvites: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true
		}
	]
}, { timestamps: true });

// Plugins
UserSchema.plugin(findOrCreate);
UserSchema.plugin(uniqueValidator);
UserSchema.plugin(require('mongoose-random'), { path: 'r' });

// Methods
UserSchema.methods.createCustomer = async function () {
	const stripeResult = await new StripeHelper().createCustomer(this.toObject().email);
	this.stripe_customer_id = stripeResult.id;
	return this.save();
};

UserSchema.methods.toJSON = function () {
	let user = this.toObject();
	let toReturn = _.pick(user, [
		'_id',
		'email',
		'gender',
		'firstName',
		'lastName',
		'country',
		'profileImageUrl',
	]);

	if (user.birthdate)
		toReturn = _.assign({}, toReturn, { birthdate: moment(user.birthdate).format('YYYY-MM-DD') });
	if (user.phoneNumber && user.phoneNumber !== '')
		toReturn = _.assign({}, toReturn, { phoneNumber: user.phoneNumber });

	return toReturn;
};

UserSchema.methods.toShort = function () {
	return _.pick(this.toObject(), ['_id', 'firstName', 'lastName', 'profileImageUrl']);
};

UserSchema.methods.removeFriend = function (id) {
	let user = this;
	return user.update({
		$pull: {
			friends: id
		}
	});
};

UserSchema.methods.removeInvite = function (id) {
	let user = this;
	return user.update({
		$pull: {
			friendInvites: id
		}
	});
};

UserSchema.methods.getFullname = function () {
	const user = this.toObject();
	return `${user.firstName} ${user.lastName}`;
};

UserSchema.statics.existsWithEmail = async function (email) {
	try {
		return await User.findOne({ email });
	} catch (e) {
		throw e;
	}
};

UserSchema.statics.findByCredentials = async function (email, password) {
	let foundUser = await User.findOne({ email });
	if (!foundUser) return;
	if (!await bcrypt.compare(password, foundUser.password)) return;
	return foundUser;
};

// Events
UserSchema.pre('save', async function () {
	let user = this;

	if (!user.isModified('password')) return Promise.resolve();

	const salt = await bcrypt.genSalt(10);
	user.password = await new Promise((resolve, reject) => {
		bcrypt.hash(user.password, salt, (err, hash) => {
			resolve(hash);
		});
	});
});

export const User = mongoose.model('User', UserSchema);

UserSchema.path('friends').validate(function (value) {
	User.findById(value).then(user => {
		if (user) return true;
		return false;
	});
}, 'User does not exist.');

UserSchema.path('friendInvites').validate(function (value) {
	User.findById(value).then(user => {
		if (user) return true;
		return false;
	});
}, 'User does not exist.');