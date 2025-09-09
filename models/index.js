const sequelize = require('../config/db');
const UserModel = require('./User');

const User = UserModel(sequelize);

module.exports = {
  sequelize,
  User,
};
