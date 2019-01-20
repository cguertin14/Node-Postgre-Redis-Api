import _ from 'lodash';
import { sequelize } from '../../db/sequelize';
import Sequelize from 'sequelize';
import moment from 'moment';
import { baseConfig, refValidator } from '../../utils/sequelize';

// Notifications types.
export const types = {
	// TODO: dertermine types.
	Test: 'Test'
};

export const Notification = sequelize.define('notification', {
	user_id: baseConfig(Sequelize.INTEGER),
	sender_id: baseConfig(Sequelize.INTEGER),
	seen: baseConfig(Sequelize.BOOLEAN, {
		default: false
	}),
	title: baseConfig(Sequelize.STRING),
	body: baseConfig(Sequelize.TEXT),
	type: baseConfig(Sequelize.ENUM, {
		values: Object.keys(types).map(key => types[key])
	})
}, { timestamps: true });