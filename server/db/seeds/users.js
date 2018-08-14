import Seeder from './seed';
import { User } from '../../api/models/User';
import faker from 'faker/locale/fr_CA';
import _ from 'lodash';
import moment from 'moment';
import asyncForEach from './../../utils/asyncForEach';
import countries from '../../config/json/countries.json';

export default class UsersCollectionSeeder extends Seeder {
    async run() {
        const mappedCountries = countries.map(c => c.name);
        
        await User.create({
            email: 'test@app.com',
            password: 'test',
            phoneNumber: faker.phone.phoneNumber(),
            firstName: 'TestFirstname',
            country: _.shuffle(mappedCountries)[0],
            stripe_customer_id: 'cus_DGFLWhfqICqZps',
            defaultCard: 'card_1CpirdEa3ylmHz4947h8rAvF',
            isAdmin: true,
            lastName: 'TestLastname',
            gender: 'male',
            birthdate: moment('1998-04-14').toDate(),
        });

        await User.create({
            email: 'test2@app.com',
            password: 'test',
            phoneNumber: faker.phone.phoneNumber(),
            firstName: 'Test2Firstname',
            country: _.shuffle(mappedCountries)[0],
            stripe_customer_id: 'cus_DGFL6BKXVROUIA',
            defaultCard: 'card_1CpiryEa3ylmHz49SgL92gE2',
            lastName: 'Test2Lastname',
            isAdmin: true,
            gender: 'male',
            birthdate: moment('1998-04-14').toDate(),
        });

        await asyncForEach(_.range(0, 40), async index => {
            const firstName = faker.name.firstName(1),
                  lastName = faker.name.lastName(1);
            await User.create({
                email: faker.internet.email(firstName, lastName, 'live.ca'),
                password: 'test',
                firstName,
                country: _.shuffle(mappedCountries)[0],
                phoneNumber: faker.phone.phoneNumber(),
                lastName,
                gender: _.shuffle(['male', 'female', 'other'])[0],
                birthdate: moment(faker.date.past(18).valueOf()).toDate(),
            });
        });

        console.log("\x1b[32m", 'Users Seeder Done');
    }
}