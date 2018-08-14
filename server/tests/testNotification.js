import { DeviceToken } from '../api/models/DeviceToken';
import '../db/mongoose'
import { User } from '../api/models/User';

(async () => {
    try {
        await DeviceToken.remove({});
        const user = await User.findOne({});
        await DeviceToken.create({
            platform: 'ios',
            user: user._id,
            token: 'e71a5041589b0bf6776bc3384aee38f4e6b4ac584c84cbea3f9d0f22c9e511c4'
        });

        await DeviceToken.create({
            platform: 'android',
            user: user._id,
            token: 'dzZscp5bD0M:APA91bGQO5Lkr_p17AEUoH2TeOa5oz_ekWctcLASfEWVQk33oTUb72qn2_E-1BlGx_AKGrvxdV_vBiZkG_jjUvEtDS-uyQLPvriQW9Gw06mylZxwLvLHX_pLAgJOcmv8YZDSmOTt4nbkealXU2vNWGRWJHKjUUACzg'
        });
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})().then(process.exit);