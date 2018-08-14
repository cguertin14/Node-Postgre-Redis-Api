import { DeviceToken } from '../../api/models/DeviceToken';
import apn from 'apn';
import gcm from 'node-gcm';
import path from 'path';
import asyncForEach from '../../utils/asyncForEach';
import _ from 'lodash';
import { User } from '../../api/models/User';
import { gcm as gcmConfig, apn as apnConfig } from './config.json';
import { Notification } from '../../api/models/Notification';

/**
 * PushNotifications class.
 */

export default class NotificationHandler {
	constructor() {
		const config = {
			gcm: gcmConfig,
			apn: {
				token: {
					..._.pick(apnConfig.token, ['keyId','teamId']),
					key: path.resolve(__dirname + '/Key.p8')
				},
				passphrase: apnConfig.passphrase,
    		production: false, // TODO: Set to true in Production.
				cert: path.resolve(__dirname + '/Dev-Notifs-Certificate.pem'),
			}
		};

		this.apnProvider = new apn.Provider(config.apn);
		this.gcmProvider = new gcm.Sender(config.gcm.id);
	}

	/**
	 * 
	 * @param {Object} Content
	 * @param {string} Content.title
	 * @param {string} Content.body
	 * @param {Object} Content.data
	 */
	send({ title, body, data }) {
		this.payload = { title, body, data };
		return this;
	}

	/**
	 * @param {[DeviceToken]} devices 
	 */
	async to(devices) {
		try {
			await asyncForEach(devices, async device => {
				// Check device platform.
				if (device.platform === 'ios') {
					await this.sendIOSNotification(device);
				} else /* Platform is then equal to android... */ {
					await this.sendAndroidNotification(device);
				}
			});
		} catch (e) {
			throw e;
		}
	}

	async sendIOSNotification(device) {
		// Set notification data.
		let notif = new apn.Notification();
		notif.payload = this.payload;
		notif.aps.data = this.payload.data || {};
		notif.alert = this.payload;
		notif.topic = '<TOPIC_HERE>';
		notif.sound = 'default';
		notif.badge = (await Notification.find({ user: device.user, seen: false }).count()) || 0;

		// Send notification using provider
		await this.apnProvider.send(notif, device.token);
	}

	async sendAndroidNotification(device) {
		// Set badge in payload.
		this.payload.data.badge = (await Notification.find({ user: device.user, seen: false }).count()) || 0
		// Set notification data.
		let notif = new gcm.Message({
			notification: {
				...this.payload,
				icon: 'ic_launcher',
				sound: 'default'
			},
			data: this.payload.data || {}
		});

		// Send notification using provider
		await this.gcmProvider.send(notif, { registrationTokens: [device.token] });
	}
}