import jwt from 'jsonwebtoken';
import { User } from '../../api/models/User';

/**
 * TestUser Class.
 */
class TestUser {
    /**
     * @returns { Promise<TestUser> }
     */
    static async create() {
        const user = await User.findOne({ email: 'test@app.com' });
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: parseInt(process.env.JWT_EXPIRES_IN) });
        const testUser = new TestUser(token);

        return new Proxy(testUser, {
            get(target, property) {
                return testUser[property] || user[property];
            }
        });
    }

    constructor(token) {
        if (!TestUser.instance) {
            this.token = token;
            TestUser.instance = this;
        }

        return TestUser.instance;
    }

    changeToken() {
        this.token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: parseInt(process.env.JWT_EXPIRES_IN) });
    }
}

export const getUser = TestUser.create;