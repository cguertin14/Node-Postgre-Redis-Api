import mongoose from 'mongoose';
import { baseConfig, refValidator } from '../../utils/mongoose';
import { User } from './User';
const { Types } = mongoose.Schema;

const DeviceTokenSchema = new mongoose.Schema({
    platform: baseConfig(String, { 
        validate: {
            validator(val) {
                return /\b(ios|android)\b/.test(val);
            },
            message: 'Platform can either be android or ios.'
        } 
    }),
    token: baseConfig(String),
    user: baseConfig(Types.ObjectId, { ref: 'User', validate: refValidator(User, 'user') })
}, { timestamps: true });

export const DeviceToken = mongoose.model('DeviceToken', DeviceTokenSchema);