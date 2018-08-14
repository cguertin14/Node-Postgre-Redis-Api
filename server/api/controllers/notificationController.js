import BaseController from './baseController';
import { Notification } from '../models/Notification';
import _ from 'lodash';
import NotificationsValidator from '../validators/notifications';
import { statuses } from '../errors/errors';
import asyncForEach from '../../utils/asyncForEach';

export default class Controller extends BaseController {
	_init() {
		this.validator = new NotificationsValidator(this);
	}

	async index() {
		// Get notifications as paginator.
		const notifications = this.paginate(
			await Notification.find({ user: this.user.id }, null, { sort: { createdAt: -1 } }).populate('sender', 'profileImageUrl'),
			this.req.query.page || 1,
			10
		);
		return this.res.json({ notifications });
	}

	async clear() {
		await Notification.find({ user: this.user.id }).remove();
		return this.res.json({ status: this.__('Removed %s', 'Notifications') });
	}

	async see() {
		const errors = this.validator.see();
		if (errors.length > 0) return this.res.status(statuses.NOT_ACCEPTABLE).json({ errors });

		// Get payload from body.
		const { notifications } = this.req.body;

		// Mark as seen all notifications in body
		await asyncForEach(notifications, async notif => {
			await Notification.findByIdAndUpdate(notif, {
				$set: {
					seen: true
				}
			});
		});

		// Return response to client.
		return this.res.json({ status: this.__('Updated %s', 'Notifications') });
	}

	async unseen() {
		const count = await Notification.find({ user: this.user.id, seen: false }).count();
		return this.res.json({ count });
	}
}