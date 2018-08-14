import RoutesHelper from './routesListing';

// List all routes.
RoutesHelper.print('/users', require('./../routes/user').default.stack);
RoutesHelper.print('/facebook', require('./../routes/facebook').default.stack);
RoutesHelper.print('/images', require('./../routes/image').default.stack);
RoutesHelper.print('/friends', require('./../routes/friend').default.stack);
RoutesHelper.print('/cards', require('./../routes/card').default.stack);
RoutesHelper.print('/notifications', require('./../routes/notification').default.stack);

process.exit(0);