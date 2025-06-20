const { Sequelize } = require('sequelize');
require('dotenv').config();
console.log('DB_NAME:', process.env.DB_NAME); // debug

const db = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql'
});

module.exports = db;