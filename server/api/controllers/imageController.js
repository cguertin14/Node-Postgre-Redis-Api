import AWS from 'aws-sdk';
import uuid from 'uuid/v1';
import BaseController from './baseController';
import { s3 } from '../../config/json/services.json';

export default class ImageController extends BaseController {
    _init() {
        this.s3 = new AWS.S3(s3);
    }

    upload() {
        const key = `${this.user.id}/${uuid()}.png`;
        this.s3.getSignedUrl('putObject', {
            Bucket: '<NAME_OF_BUCKER_HERE>',
            ContentType: 'image/png',
            Key: key
        }, (err, url) => {
            if (err) throw err;
            this.res.json({ key: `${s3.url}/${key}`, url });
        });
    }
}