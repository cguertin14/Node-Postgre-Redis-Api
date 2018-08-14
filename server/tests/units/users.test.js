import expect from 'expect';
import request from 'supertest';
import _ from 'lodash';
import { User } from './../../api/models/User';
import { server } from '../../server';
import { user } from '../setup';

afterAll(() => {
    server.close();
});

describe('Users Requests', () => {
    describe('POST /users/login', () => {
        test('should login user and return token', (done) => {
            let email = 'test@app.com',
                password = 'test';
            request(server)
                .post('/users/login')
                .type('urlencoded')
                .send({
                    email,
                    password
                })
                .expect(200)
                .expect(res => {
                    expect(res.body.token).toBeTruthy();
                })
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }

                    expect(res.body.status).toBe('Logged in');
                    return done();
                });
        });

        test('should reject invalid login', (done) => {
            let email = 'a@a.a',
                password = 'somethingWrong';
            request(server)
                .post('/users/login')
                .type('urlencoded')
                .send({
                    email,
                    password
                })
                .expect(401)
                .expect(res => {
                    expect(res.body.token).toBeFalsy();
                })
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }

                    return done();
                });
        });
    });

    describe('GET /users/me', () => {
        test('should return a user if authenticated', (done) => {
            request(server)
                .get('/users/me')
                .type('urlencoded')
                .set('authorization', `Bearer ${user.token}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.user.firstName).toBe(user.firstName);
                    expect(res.body.user.email).toBe(user.email);
                })
                .end(done);
        });

        test('should return 401 if not authenticated', (done) => {
            request(server)
                .get('/users/me')
                .expect(401)
                .expect((res) => {
                    expect(res.body).toEqual({
                        error: 'Unauthenticated.'
                    });
                })
                .end(done);
        });
    });

    describe('POST /users', () => {
        test('should create a user', (done) => {
            let email = 'martin@martin.com',
                firstName = 'Martin',
                lastName = 'Deschamps',
                password = '123456313123',
                gender = 'male',
                phoneNumber = '1112223333';

            request(server)
                .post('/users')
                .type('urlencoded')
                .send({
                    email,
                    password,
                    firstName,
                    lastName,
                    gender,
                    phoneNumber
                })
                .expect(201)
                .expect(res => {
                    expect(res.body.token).toBeTruthy();
                    expect(res.body.user._id).toBeTruthy();
                    expect(res.body.user.email).toBe(email);
                })
                .end(async err => {
                    if (err) {
                        return done(err);
                    }

                    let user = await User.findOne({ email });
                    expect(user).toBeTruthy();
                    expect(user.password).not.toBe(password);
                    done();
                });
        });

        test('should return a validation errors if request is invalid', (done) => {
            const email = 'martin@martin.com',
                  firstName = 'Martin',
                  lastName = 'Deschamps',
                  password = '12345611',
                  gender = 'female',
                  phoneNumber = '1113335555';

            request(server)
                .post('/users')
                .type('urlencoded')
                .send({
                    email,
                    password,
                    firstName,
                    lastName,
                    gender,
                    phoneNumber
                })
                .expect(409)
                .end(done);
        });

        test('should not create a user if email in use', (done) => {
            let email = 'test@app.com';
            let password = '123456131';
            let firstName = 'Martin';
            let lastName = 'Deschamps';

            request(server)
                .post('/users')
                .type('urlencoded')
                .send({
                    email,
                    password,
                    firstName,
                    lastName
                })
                .expect(406)
                .end(done);
        });
    });

    describe('DELETE /users/logout', () => {
        test('should remove token on logout', (done) => {
            request(server)
                .delete('/users/logout')
                .type('urlencoded')
                .set('authorization', `Bearer ${user.token}`)
                .expect(200)
                .expect(res => {
                    expect(res.body.status).toBe('Logged out');
                })
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }

                    done();
                });
        });
    });

    describe('GET /users/dashboard', () => {
        test('should have all sections of data', (done) => {
            user.changeToken();
            request(server)
                .get('/users/dashboard')
                .type('urlencoded')
                .set('authorization', `Bearer ${user.token}`)
                .expect(200)
                .expect(res => {
                    expect(res.body).toBeTruthy();
                    expect(Object.keys(res.body)).toEqual([
                        'banners',
                        'restaurants',
                        'moods',
                        'venues',
                        'musicStyles'
                    ]);
                })
                .end(done);
        });
    });
});