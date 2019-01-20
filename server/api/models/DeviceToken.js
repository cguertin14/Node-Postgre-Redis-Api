import { sequelize } from '../../db/sequelize';
import Sequelize from 'sequelize';
import { baseConfig } from '../../utils/sequelize';

export const DeviceToken = sequelize.define('device_token', {
	token: baseConfig(Sequelize.STRING),
	user_id: baseConfig(Sequelize.INTEGER),
	platform: baseConfig(Sequelize.ENUM, {
		values: ['ios', 'android']
	}),
}, { timestamps: true });