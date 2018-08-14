import _ from 'lodash';
import mongoose from 'mongoose';
import moment from 'moment';
import { baseConfig, refValidator } from '../../utils/mongoose';
import { User } from './User';
const { Types } = mongoose.Schema;

// Notifications types.
export const types = {
	// TODO: dertermine types.
};

const NotificationSchema = new mongoose.Schema({
	user: baseConfig(Types.ObjectId, { ref: 'User', validate: refValidator(User, 'user') }),
	seen: baseConfig(Boolean, { required: false, default: false }),
	title: baseConfig(String),
	body: baseConfig(String),
	type: baseConfig(String, {
		validate: {
			validator(value) {
				return new RegExp(`\\b(${Object.keys(types).map(key => types[key]).join('|')})\\b`).test(value);
			},
			message: `{VALUE} can either be ${Object.keys(types).map(key => types[key]).join('|')}.`
		}
	}),
	sender: baseConfig(Types.ObjectId, { ref: 'User', validate: refValidator(User, 'user') }),
}, { timestamps: true });

// Plugins
NotificationSchema.plugin(require('mongoose-paginate'));

// Methods
NotificationSchema.methods.toJSON = function () {
	const notif = this.toObject();
	return _.assign({}, {
		..._.pick(notif, ['_id', 'title', 'body', 'seen', 'type', 'sender']),
		createdAt: moment(notif.createdAt).format('YYYY-MM-DD HH:mm:ss')
	});
};

export const Notification = mongoose.model('Notification', NotificationSchema);