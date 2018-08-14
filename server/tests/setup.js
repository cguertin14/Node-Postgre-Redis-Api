jest.setTimeout(30000);

import { getUser } from './helpers/user';
let user;

beforeAll(async () => {
    user = await getUser();
});

export { user };