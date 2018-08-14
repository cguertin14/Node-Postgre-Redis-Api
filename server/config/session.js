import session from 'express-session';

export default session({
    secret: 'secret', 
    resave: true, 
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: new Date(Date.now() + 3600000)
    }
});