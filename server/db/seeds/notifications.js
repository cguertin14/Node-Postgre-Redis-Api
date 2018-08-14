import Seeder from './seed';
import { Notification, types } from '../../api/models/Notification';
import faker from 'faker/locale/fr_CA';
import _ from 'lodash';
import asyncForEach from './../../utils/asyncForEach';
import { User } from '../../api/models/User';

export default class NotificationsCollectionSeeder extends Seeder {
  async run() {
    const mappedTypes = Object.keys(types).map(key => types[key]);
    await asyncForEach(await User.find({}).select('_id'), async user => {
      await asyncForEach(_.range(0, 30), async index => {
        const type = _.shuffle(mappedTypes)[0];
        const data = {
          title: faker.name.title(),
          body: faker.lorem.words(20),
          user: user._id,
          type,
          sender: (await User.findRandom().select('_id'))[0]._id
        }; 
        await Notification.create(data);
      });
    });
    console.log("\x1b[32m", 'Notifications Seeder Done');
  }
}