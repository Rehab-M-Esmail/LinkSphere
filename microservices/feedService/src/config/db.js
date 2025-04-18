const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(process.env.DB_URL);

sequelize.authenticate()
  .then(() => console.log('Database connected'))
  .catch(err => console.log('Unable to connect to the database:', err));

module.exports = sequelize;
