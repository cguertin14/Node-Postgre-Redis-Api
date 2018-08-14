// Config.
import '../config/config';
import './mongoose';

// Seeders.
import UsersCollectionSeeder from './seeds/users';
import FriendCollectionSeeder from './seeds/friends';
import NotificationsCollectionSeeder from './seeds/notifications';

// Models.
import { User } from '../api/models/User';
import { Notification } from '../api/models/Notification';
import { DeviceToken } from '../api/models/DeviceToken';

(async () => {
    // Truncate tables
    await User.remove();
    await Notification.remove();
    await DeviceToken.remove();

    // Run seeders
    await new UsersCollectionSeeder().run();
    await new FriendCollectionSeeder().run();
    await new NotificationsCollectionSeeder().run();
})().then(process.exit)
    .catch(e => {
        console.error(e);
        process.exit(1);
    });