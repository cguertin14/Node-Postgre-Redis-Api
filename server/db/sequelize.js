import Sequelize from 'sequelize';

export const sequelize = new Sequelize('template_api', 'postgres', 'postgres', {
  host: 'postgres',
  dialect: 'postgres',

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },

  // http://docs.sequelizejs.com/manual/tutorial/querying.html#operators
  operatorsAliases: false
});

sequelize.authenticate()
  .then(() => console.log('Connected'))
  .catch(err => console.error(err));