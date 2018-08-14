import { ExtractJwt } from 'passport-jwt/lib';
import jwt from 'jsonwebtoken';
import randtoken from 'rand-token';
import redis from 'redis';
import moment from 'moment';
import { error, codes, statuses } from '../api/errors/errors';
const client = redis.createClient(process.env.REDISCLOUD_URL || 'redis://redis:6379');
client.select(1, () => {});
client.get = require('util').promisify(client.get);

/**
 * Check if a token is blacklisted or not.
 * 
 * @param {*} req
 * @returns { Boolean }
 */
export const isTokenBlacklisted = async (req) => {
    try {
        const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
        jwt.decode(token, process.env.JWT_SECRET);
        return await client.get(token);
    } catch (e) { 
        throw e;
    }
};

/**
 * Blacklist a token using redis.
 * 
 * @param {*} request
 * @returns { void }
 */
export const blacklistToken = async (request) => {
    try {
        const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
        const decoded = jwt.decode(token, process.env.JWT_SECRET);
        const expiration = new Date(moment(decoded.exp * 1000 + 9999999)).getMinutes();
        await client.set(token, 'blacklisted', 'EX', expiration * 9999999);
    } catch (e) {
        throw e;
    }
};

/**
 * Set token and refresh token.
 * 
 * @param {*} user 
 * @param {*} res 
 */
export const setTokens = (user, res) => {
    // Set token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: parseInt(process.env.JWT_EXPIRES_IN) });

    // Change refresh key and token.
    const secretRefresh = randtoken.generate(50);
    res.cookie('JWT_REFRESH', secretRefresh, { maxAge: 9999999000, httpOnly: true });
    const refreshToken = jwt.sign({ _id: user._id }, secretRefresh);

    return { token, refreshToken };
};

/**
 * Token validation function.
 * 
 * @param {*} e 
 */
export const tokenValidation = (e, res) => {
    if (e instanceof jwt.JsonWebTokenError) {
        e.message = 'Token is malformed.';
    } else if (e instanceof jwt.NotBeforeError) {
        e.message = 'Token contains a wrong timestamp.';
    } else if (e instanceof jwt.TokenExpiredError) {
        e.message = 'Token is expired.';
    } else {
        e.message = 'Token is invalid.';
    }
    return res.status(statuses.UNAUTHORIZED).json(
        error(codes.UNACCEPTABLE_CONTENT_ERROR, e.message)
    );
};