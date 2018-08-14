import expect from 'expect';
import request from 'supertest';
import _ from 'lodash';
import { User } from './../../api/models/User';
import { user } from '../setup';
import { server } from '../../server';

afterAll(() => {
    server.close();
});

describe('Friends Requests', () => {
    describe('GET /friends', () => {
        test('should return empty or populated array of friends', (done) => {
            request(server)
                .get('/friends')
                .type('urlencoded')
                .set('authorization', `Bearer ${user.token}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.friends).toBeTruthy();
                    expect(res.body.friends instanceof Array).toBe(true);
                })
                .end(done);
        });
    });

    describe('GET /friends/invites', () => {
        test('should return empty or populated array of invites', (done) => {
            request(server)
                .get('/friends/invites')
                .type('urlencoded')
                .set('authorization', `Bearer ${user.token}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.friendInvites).toBeTruthy();
                    expect(res.body.friendInvites instanceof Array).toBe(true);
                })
                .end(done);
        });
    });

    describe('POST /friends/:id', () => {
        test('should send a friend invite to given user', async (done) => {
            const invite = await User.findOne({})
                                     .where('_id')
                                     .nin(user.friends.concat(user.friendInvites).concat([user._id]))
                                     .select('_id');
            expect(invite._id.toString()).toBeTruthy();
            request(server)
                .post(`/friends/${invite._id.toString()}`)
                .type('urlencoded')
                .set('authorization', `Bearer ${user.token}`)
                .expect(201)
                .expect((res) => {
                    expect(res.body.status).toBeTruthy();
                    expect(res.body.status).toBe('Friend request successfully sent!');
                })
                .end(done);
        });
    });

    describe('GET /friends/:id', () => {
        test('should get a friend\'s information', async (done) => {
            const friendId = user.friends[0]._id.toString();
            request(server)
                .get(`/friends/${friendId}`)
                .type('urlencoded')
                .set('authorization', `Bearer ${user.token}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.friend).toBeTruthy();
                    expect(res.body.friend._id).toBe(friendId);
                })
                .end(done);
        });
    });

    describe('DELETE /friends/:id', () => {
        test('should remove a friend from current user', async (done) => {
            const friendId = user.friends[0]._id.toString();
            request(server)
                .delete(`/friends/${friendId}`)
                .type('urlencoded')
                .set('authorization', `Bearer ${user.token}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.status).toBeTruthy();
                    expect(res.body.status).toBe('Friend successfully removed!');
                })
                .end(done);
        });
    });
});