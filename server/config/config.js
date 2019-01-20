const env = process.env.NODE_ENV || 'development';

if (['test'].includes(env)) {
    let config = require('./json/config.json');
    let envConfig = config[env];
    Object.keys(envConfig).forEach(key => process.env[key] = envConfig[key]);
}

if (env === 'heroku') {
    process.env.URL = 'https://<NAME_OF_APP_HERE>.herokuapp.com';
} else if (env === 'development') {
    process.env.URL = `http://localhost:${process.env.PORT || 3000}`;
}