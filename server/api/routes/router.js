// Router function.
export default function(app) {
  app.use('/users', require('./user').default);
  app.use('/facebook', require('./facebook').default);
  app.use('/images', require('./image').default);
  app.use('/friends', require('./friend').default);
  app.use('/cards', require('./card').default);
  app.use('/notifications', require('./notification').default);
};