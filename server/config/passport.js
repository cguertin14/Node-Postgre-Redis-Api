import passport from 'passport/lib';
import { Strategy as LocalSrategy } from 'passport-local/lib';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt/lib';
import { User } from '../api/models/User';

// Bearer config....
passport.use(new LocalSrategy({
    usernameField: 'email',
    passwordField: 'password'
},
    async function (email, password, done) {
        try {
            let user = await User.findByCredentials(email, password);
            if (!user) {
                return done(null, false, { message: 'Incorrect email or password.' });
            }          
            return done(null, user, { message: 'Logged in' });
        } catch (e) {
            return done(e, false);
        }
    }
));

// JWT config...
passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
},
    async function (jwtPayload, done) {
        try {
            const user = await User.findById(jwtPayload._id)
                                   .populate('friendInvites')
                                   .populate('friends')
                                   .cache();
            if (!user) {
                return done(null, false);
            }
            return done(null, user);
        } catch (e) {
            return done(e, false);
        }
    }
));

// Session configuration.
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

