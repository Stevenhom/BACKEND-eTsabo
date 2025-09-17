// config/db.js

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.POSTGRES_DB, process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  // timezone: '+03:00',
  dialect: 'postgres',
  logging: false, // Active si tu veux voir les requêtes SQL
});

module.exports = sequelize;
