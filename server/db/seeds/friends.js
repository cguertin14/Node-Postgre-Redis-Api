import Seeder from './seed';
import { User } from '../../api/models/User';
import _ from 'lodash';
import asyncForEach from './../../utils/asyncForEach';

export default class FriendCollectionSeeder extends Seeder {
    async run() {
        const users = await User.find({});
        let testUser1 = users.find(u => u.email === 'test@app.com'), testUser2 = users.find(u => u.email === 'test2@app.com');

        // Add other friends and invite some (to first user)
        const testInvites = _.chunk(_.shuffle(users), 4)[0];
        const testFriends = _.chunk(_.differenceWith(users, testInvites, _.isEqual), 4)[0];
        let condition1 = (u) => u._id.toHexString() !== testUser1._id.toHexString();
        testUser1.friends = testFriends.filter(u => condition1(u)).map(f => f._id);
        testUser1.friendInvites = testInvites.filter(u => condition1(u)).map(f => f._id);
        await testUser1.save();

        // Same but for second user.
        let condition2 = (u) => u._id.toHexString() !== testUser2._id.toHexString();
        let condition3 = (u) => condition2(u) && u._id.toHexString() !== testUser1._id.toHexString();
        testUser2.friends = testFriends.filter(u => condition2(u)).map(u => u._id);
        testUser2.friendInvites = testInvites.filter(u => testFriends.find(u2 => u2._id.toHexString() === testUser1._id.toHexString()) ? condition2(u) : condition3(u))
                                             .map(u => u._id);
        await testUser2.save();

        // Add testUser1 and testUser2 as friend to other users.
        await asyncForEach(testFriends.filter(u => u._id.toHexString() !== testUser1._id.toHexString() && u._id !== testUser2._id.toHexString()), async friend => {
            friend.friends.push(testUser1._id);
            friend.friends.push(testUser2._id);
            await friend.save();
        });

        console.log('\x1b[32m', 'Friend Seeder Done');
    }
}