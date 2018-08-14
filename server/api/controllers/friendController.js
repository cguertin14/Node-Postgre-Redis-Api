import BaseController from './baseController';
import { User } from '../models/User';
import { Notification } from '../models/Notification';
import { statuses, codes, error } from '../errors/errors';
import FriendsValidator from '../validators/friends';
import NotFoundError from '../exceptions/errors/NotFoundError';
import NotAcceptableError from '../exceptions/errors/NotAcceptableError';
import SendNotificationJob from '../jobs/sendNotificationJob';
import { types } from '../models/Notification';
import i18n from '../../config/i18n';

export default class FriendController extends BaseController {
	_init() {
		this.validator = new FriendsValidator(this);
	}

	async index() {
		let { friends } = this.user;
		return this.res.json({ friends: friends.map(f => f.toShort()) });
	}

	async invites() {
		const { friendInvites } = this.user;
		return this.res.json({ friendInvites: friendInvites.map(f => f.toShort()) });
	}

	async get(id) {
		let friend = this.user.friends.find(f => f._id.toString() === id);
		if (friend) {
			friend = await User.populate(friend, [
				{ path: 'friends', select: 'firstName lastName imageUrl' },
			]);
			return this.res.json({ friend });
		}
		// Friend doesnt exist.
		throw new NotFoundError(this.__, 'Friend');
	}

	async invite(id) {
		if (id === this.user.id) {
			return this.res.status(statuses.NOT_ACCEPTABLE).json(
				error(codes.UNACCEPTABLE_CONTENT_ERROR, this.__('FriendIsMe'))
			);
		}

		// Check if friend exists
		const friend = await User.findById(id).cache();
		if (!friend) {
			throw new NotFoundError(this.__, 'User');
		}

		const friendIsInList = this.user.friends.find(f => f._id.toString() === id);
		const friendInvitedMe = this.user.friendInvites.find(f => f._id.toString() === id);
		const friendHasReceivedInvitation = friend.friendInvites.find(f => f.toString() === this.user.id.toString());
		if (friendIsInList) {
			throw new NotAcceptableError(this.__, this.__('FriendExists'));
		} else if (friendInvitedMe) {
			throw new NotAcceptableError(this.__, this.__('FriendInvitedMe %s', friend.getFullname()));
		} else if (friendHasReceivedInvitation) {
			throw new NotAcceptableError(this.__, this.__('FriendRequestAlreadySent'));
		}

		// Invite friend.
		friend.friendInvites.push(this.user.id);
		await friend.save();

		// Send notification to other user.
		i18n.setLocale(friend.locale);
		new SendNotificationJob({
			title: i18n.__('NewFriendInvitationTitle'),
			body: i18n.__('NewFriendInvitationBody %s', this.user.getFullname()),
			receiver: friend._id,
			sender: this.user.id,
			type: types.NewFriendRequest
		});

		return this.res.status(statuses.CREATED_OR_UPDATED).json({
			status: this.__('FriendRequestSent')
		});
	}

	async answer(id) {
		const errors = this.validator.answer();
		if (errors.length > 1)
			return this.res.status(statuses.NOT_ACCEPTABLE).json({ errors });

		let friendInvite = this.user.friendInvites.find(i => i._id.toString() === id);
		if (!friendInvite) {
			throw new NotFoundError(this.__, 'Friend Invitation');
		}

		// Get status in body
		const { status } = this.req.body;

		await Notification.update({ user: this.user.id, sender: friendInvite._id, type: types.NewFriendRequest }, { seen: true }, { multi: true });
		// Add other user as friend to current user.
		let accepted = false;
		if (status === 'accepted') {
			// Add user to friends.
			accepted = true;
			this.user.friends.push(friendInvite);
			await this.user.save();

			// Add current user to other user as friends.
			friendInvite.friends.push(this.user.id);
			await friendInvite.save();

			// Send NOTIFICATION to friend to tell him current user accepted him/her.
			i18n.setLocale(friendInvite._id)
			new SendNotificationJob({
				title: i18n.__('NewFriendTitle'),
				body: i18n.__('NewFriendBody %s', this.user.getFullname()),
				receiver: friendInvite._id,
				sender: this.user.id,
				type: types.NewFriend
			});
		}

		// Remove friend invite
		await this.user.removeInvite(id);

		return this.res.status(statuses.CREATED_OR_UPDATED).json({
			status: this.__(accepted ? 'FriendRequestAccepted' : 'FriendRequestRefused')
		});
	}

	async remove(id) {
		let friend = this.user.friends.find(f => f._id.toString() === id);
		if (!friend) {
			throw new NotFoundError(this.__, 'Friend');
		}
		await this.user.removeFriend(id);
		await friend.removeFriend(this.user.id);
		return this.res.json({ status: this.__('Removed %s', 'Friend') });
	}
}