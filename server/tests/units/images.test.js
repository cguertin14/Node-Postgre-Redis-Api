import expect from 'expect';
import request from 'supertest';
import _ from 'lodash';
import { User } from './../../api/models/User';
import { user } from '../setup';
import { server } from '../../server';

afterAll(() => {
    server.close();
});

describe('Images Requests', () => {
    describe('GET /images/upload', () => {
        test('should return key and url', (done) => {
            request(server)
                .get('/images/upload')
                .type('urlencoded')
                .set('authorization', `Bearer ${user.token}`)
                .expect(200)
                .expect((res) => {
                    expect(Object.keys(res.body)).toEqual(['key', 'url']);
                })
                .end(done);
        });
    });
});