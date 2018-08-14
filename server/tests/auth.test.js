import expect from 'expect';
import request from 'supertest';
import _ from 'lodash';
import { ObjectId } from 'mongodb';
import { app } from './../server';
import { User } from './../api/models/User';
import { users, populateUsers } from './seed/seed';

beforeEach(populateUsers);

describe('POST /users/login', () => {
    it('should login user and return auth token', (done) => {
        let email = users[1].email, password = users[1].password;
        request(app)
            .post('/users/login')
            .type('urlencoded')
            .send({ email, password })
            .expect(200)
            .expect(res => {
                expect(res.body.token).toBeTruthy();
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                User.findById(users[1]._id).then(user => {
                    expect(user.toObject().tokens[1]).toMatchObject({
                        access: 'auth',
                        token: res.body.token
                    });
                    done();
                }).catch(e => done(e));
            });
    });

    it('should reject invalid login', (done) => {
        let email = 'a@a.a', password = 'jaqueline';
        request(app)
            .post('/users/login')
            .type('urlencoded')
            .send({ email, password })
            .expect(401)
            .expect(res => {
                expect(res.body.token).toBeFalsy();
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                User.findById(users[1]._id).then(user => {
                    expect(user.tokens.length).toBe(1);
                    done();
                }).catch(e => done(e));
            });
    });
});

describe('GET /users/me', () => {
    it('should return a user if authenticated', (done) => {
        request(app)
            .get('/users/me')
            .type('urlencoded')
            .set('authorization', `Bearer ${users[1].tokens[0].token}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.user._id).toBe(users[1]._id.toHexString());
                expect(res.body.user.email).toBe(users[1].email);
            })
            .end(done);
    });

    it('should return 401 if not authenticated', (done) => {
        request(app)
            .get('/users/me')
            .expect(401)
            .expect((res) => {
                expect(res.body).toEqual({ error: 'Invalid Token' });
            })
            .end(done);
    });
});

describe('POST /users', () => {
    it('should create a user', (done) => {
        let email = 'example@example.com';
        let firstName = 'Martin';
        let lastName = 'Deschamps';
        let password = '123456';

        request(app)
            .post('/users')
            .type('urlencoded')
            .send({ email, password, firstName, lastName })
            .expect(201)
            .expect(res => {
                expect(res.body.token).toBeTruthy();
                expect(res.body.user._id).toBeTruthy();
                expect(res.body.user.email).toBe(email);
            })
            .end(err => {
                if (err) {
                    return done(err);
                }

                User.findOne({ email }).then(user => {
                    expect(user).toBeTruthy();
                    expect(user.password).not.toBe(password);
                    done();
                }).catch(e => done(e));
            });
    });

    it('should return a validation errors if request is invalid', (done) => {
        let email = 'test@example.com';
        let firstName = 'Martin';
        let lastName = 'Deschamps';
        let password = '123456';

        request(app)
            .post('/users')
            .type('urlencoded')
            .send({ email, password, firstName, lastName })
            .expect(406)
            .end(done);
    });

    it('should not create a user if email in use', (done) => {
        let email = users[0].email;
        let password = '123456';
        let firstName = 'Martin';
        let lastName = 'Deschamps';

        request(app)
            .post('/users')
            .type('urlencoded')
            .send({ email, password, firstName, lastName })
            .expect(406)
            .end(done);
    });
});

describe('DELETE /users/logout', () => {
    it('should remove token on logout', (done) => {
        request(app)
            .delete('/users/logout')
            .type('urlencoded')
            .set('authorization', `Bearer ${users[0].tokens[0].token}`)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                User.findById(users[0]._id).then(user => {
                    expect(user.tokens.length).toBe(0);
                    done();
                }).catch(e => done(e));
            })
    });
});