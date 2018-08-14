import expect from 'expect';
import request from 'supertest';
import _ from 'lodash';
import { User } from './../../api/models/User';
import { user } from '../setup';
import { server } from '../../server';

let cards = [];

afterAll(() => {
    server.close();
});

describe('Cards Requests', () => {
    describe('GET /cards', () => {
        test('should return an array of cards', (done) => {
            request(server)
                .get('/cards')
                .type('urlencoded')
                .set('authorization', `Bearer ${user.token}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.cards instanceof Array).toBe(true);
                    cards = res.body.cards;
                })
                .end(done);
        });
    });

    describe('POST /cards', () => {
        test('should add a card to stripe', (done) => {
            request(server)
                .post('/cards')
                .type('urlencoded')
                .send({ card_token: 'tok_visa' })
                .set('authorization', `Bearer ${user.token}`)
                .expect(201)
                .expect((res) => {
                    expect(Object.keys(res.body)).toEqual(['card'])
                })
                .end(done);
        });
    });

    describe('PUT /cards/setdefault/:id', () => {
        test('should set a default card', (done) => {
            cards.splice(0, 1);
            request(server)
                .put(`/cards/setdefault/${cards[0].id}`)
                .type('urlencoded')
                .set('authorization', `Bearer ${user.token}`)
                .expect(201)
                .expect((res) => {
                    const { status } = res.body;
                    expect(status).toBeTruthy();
                    expect(status).toBe('Default card successfully set!');
                })
                .end(done);
        });
    });

    describe('GET /cards/:id', () => {
        test('should return a card', (done) => {
            request(server)
                .get(`/cards/${cards[0].id}`)
                .type('urlencoded')
                .send({ card_token: 'tok_visa' })
                .set('authorization', `Bearer ${user.token}`)
                .expect(200)
                .expect((res) => {
                    const { card } = res.body;
                    expect(card).toBeTruthy();
                    expect(card.id).toBe(cards[0].id);
                })
                .end(done);
        });
    });

    describe('DELETE /cards/:id', () => {
        test('should delete a card', (done) => {
            request(server)
                .delete(`/cards/${cards[0].id}`)
                .type('urlencoded')
                .set('authorization', `Bearer ${user.token}`)
                .expect(200)
                .expect((res) => {
                    const { result } = res.body;
                    expect(result).toBeTruthy();
                    expect(result.id).toBe(cards[0].id);
                })
                .end(done);
        });
    });
});