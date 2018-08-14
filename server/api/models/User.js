import _ from 'lodash';
import bcrypt from 'bcryptjs';
import moment from 'moment';
import { baseConfig, dateConfig, refValidator, baseConfigUrl, countryConfig } from '../../utils/sequelize';
import { sequelize } from '../../db/sequelize';
import Sequelize from 'sequelize';
import StripeHelper from '../../config/payments/StripeHelper';
import { s3 } from '../../config/json/services.json';

export const User = sequelize.define('user', {
	email: baseConfig(Sequelize.STRING, {
		minlength: 1,
		unique: true
	}),
	password: baseConfig(Sequelize.STRING, {
		minlength: 6,
		allowNull: false
	}),
	firstName: baseConfig(Sequelize.STRING, {
		trim: true,
		minlength: 1,
	}),
	lastName: baseConfig(Sequelize.STRING, {
		trim: true,
		minlength: 1,
	}),
	isAdmin: baseConfig(Boolean, { default: false }),
	locale: baseConfig(Sequelize.STRING, { default: 'en' }),
	birthdate: dateConfig({ allowNull: false }),
	gender: baseConfig(Sequelize.STRING, {
		validate: {
			validator(val) {
				return /\b(male|female|other)\b/.test(val);
			},
			message: '{VALUE} must be male, female or other.'
		}
	}),
	phoneNumber: {
		type: Sequelize.STRING,
		allowNull: false,
		set: (val) => {
			if (val === null || val === '')
				return undefined;
			return val;
		}
	},
	country: countryConfig(),
	defaultCard: baseConfig(Sequelize.STRING, { allowNull: false }),
	profileImageUrl: baseConfigUrl({ allowNull: false, default: `${s3.url}/profile_default.png` }),
	facebookId: {
		type: Sequelize.STRING,
		allowNull: false,
		default: null
	},
	stripe_customer_id: {
		type: Sequelize.STRING,
		allowNull: false,
		default: null
	}
}, { timestamps: true });

// Methods
User.createCustomer = async function () {
	const stripeResult = await new StripeHelper().createCustomer(this.toObject().email);
	this.stripe_customer_id = stripeResult.id;
	return this.save();
};

User.toJSON = function () {
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

User.toShort = function () {
	return _.pick(this.toObject(), ['_id', 'firstName', 'lastName', 'profileImageUrl']);
};

User.removeFriend = function (id) {
	let user = this;
	return user.update({
		$pull: {
			friends: id
		}
	});
};

User.removeInvite = function (id) {
	let user = this;
	return user.update({
		$pull: {
			friendInvites: id
		}
	});
};

User.getFullname = function () {
	const user = this.toObject();
	return `${user.firstName} ${user.lastName}`;
};

User.statics.existsWithEmail = async function (email) {
	try {
		return await User.findOne({ email });
	} catch (e) {
		throw e;
	}
};

User.statics.findByCredentials = async function (email, password) {
	let foundUser = await User.findOne({ email });
	if (!foundUser) return;
	if (!await bcrypt.compare(password, foundUser.password)) return;
	return foundUser;
};

// Events
User.pre('save', async function () {
	let user = this;

	if (!user.isModified('password')) return Promise.resolve();

	const salt = await bcrypt.genSalt(10);
	user.password = await new Promise((resolve, reject) => {
		bcrypt.hash(user.password, salt, (err, hash) => {
			resolve(hash);
		});
	});
});

User.path('friends').validate(function (value) {
	User.findById(value).then(user => {
		if (user) return true;
		return false;
	});
}, 'User does not exist.');

User.path('friendInvites').validate(function (value) {
	User.findById(value).then(user => {
		if (user) return true;
		return false;
	});
}, 'User does not exist.');