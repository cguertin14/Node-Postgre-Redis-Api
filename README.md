# Summary

REST API Template in Node JS

## Status
[![Build Status](https://travis-ci.com/cguertin14/Node-REST-API-Template.svg?token=wMAojsLhP9yFixAFFg69&branch=master)](https://travis-ci.com/cguertin14/Node-REST-API-Template)

## Author 

Charles Guertin

## Running the tests

Running the tests is easy, all you have to do is execute this command in your terminal:

```
npm test
```

## Seed Data

With this template, you can add seeders classes in '/server/db/seed/' and call them inside of the async function in '/server/db/seeds/seeder.js'. To generate (seed) fake data, all you have to do is run the following command:

```
npm run seed
```

## Visualise Routes

Remembering the routes you wrote can be very painful. You can call the routes you want to see in the console in '/server/api/console/cli-routes.js'. To remediate to that problem, you can run the following command to visualise all your routes.

```
npm run routes
```

## Middlewares

Middlewares can be added at anytime in the '/server/api/middlewares' folder.

## Technologies

* Node.js
* Express.js
* Passport.js
* Mongoose.js
* Mocha.js
* JWT