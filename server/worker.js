import './db/mongoose';
import kue from 'kue';
import _ from 'lodash';
import { DeviceToken } from './api/models/DeviceToken';
import { Notification } from './api/models/Notification';
import StripeHelper from './config/payments/StripeHelper';
import NotificationHandler from './config/notifications/NotificationHandler';
import SmsHandler from './config/sms/SmsHandler';

const jobs = kue.createQueue({
	redis: process.env.REDISCLOUD_URL || 'redis://redis:6379'
});

jobs.process('stripe charge', async function (job, done) {
	const { price, stripe_customer_id, card, description } = job.data;
	const stripe = new StripeHelper(stripe_customer_id);
	await stripe.createCharge({ amount: price, source: card, description });
	done();
});

jobs.process('sendNotification', async function (job, done) {
	try {
		let { title, body, receiver, data, sender, type } = job.data;
		const notifHandler = new NotificationHandler();
		data = data || {};
	
		// Create notification in database.
		let notif = await Notification.create({
			user: receiver,
			title,
			body,
			sender,
			type,
			...data
		});
		
		// Get devices from receiver
		const devices = await DeviceToken.find({ user: receiver });

		// Send notification
		await notifHandler.send({ 
			..._.pick(notif, ['title', 'body']), 
			data: _.assign({}, data, { _id: notif._id, type }) 
		}).to(devices);
		
		done();
	} catch (e) {
		console.error(e); // TODO: Remove in Production
		done(e);
	}
});

jobs.process('sms', function (job, done) {
	const { message, to } = job.data;
	const smsHandler = new SmsHandler();
	smsHandler.send(message).to(to);
	done();
});