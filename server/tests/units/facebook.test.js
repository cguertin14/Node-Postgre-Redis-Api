import expect from 'expect';
import request from 'supertest';
import _ from 'lodash';
import { User } from './../../api/models/User';
import { user } from '../setup';
import { server } from '../../server';

afterAll(() => {
    server.close();
});

describe('Facebook Requests', () => {
    describe('POST /facebook/signup', () => {
        test('should signup a user using facebook', (done) => {
            request(server)
                .post('/facebook/signup')
                .type('urlencoded')
                .send({ access_token: '<ACCESS_TOKEN_HERE>' })
                .expect(201)
                .expect((res) => {
                    expect(res.body).toBeTruthy();
                    expect(res.body.status).toBe('Logged in');
                })
                .end(done);
        });
    });

    describe('POST /facebook/login', () => {
        test('should login a user using facebook', (done) => {
            request(server)
                .post('/facebook/login')
                .type('urlencoded')
                .send({ access_token: '<ACCESS_TOKEN_HERE>' })
                .expect(200)
                .expect((res) => {
                    expect(res.body).toBeTruthy();
                    expect(res.body.status).toBe('Logged in');
                })
                .end(done);
        });
    });

    describe('POST /facebook/link', () => {
        test('should link current account to facebook', (done) => {
            request(server)
                .put('/facebook/link')
                .type('urlencoded')
                .send({ fb_access_token: '<ACCESS_TOKEN_HERE>' })
                .set('authorization', `Bearer ${user.token}`)
                .expect(201)
                .expect((res) => {
                    expect(res.body).toBeTruthy();
                    expect(res.body.status).toBe('Facebook account successfully linked!');
                })
                .end(done);
        });
    });
});