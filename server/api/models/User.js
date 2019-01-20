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
		set(val) {
			if (val === null || val === '')
				return undefined;
			return val;
		}
	},
	country: countryConfig(),
	defaultCard: baseConfig(Sequelize.STRING, { allowNull: false }),
	profile_image_url: baseConfigUrl({ allowNull: false, default: `${s3.url}/profile_default.png` }),
	facebook_id: {
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