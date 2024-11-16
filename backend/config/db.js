const { Sequelize } = require('sequelize');

// Charger les variables d'environnement
require('dotenv').config();

// Initialiser Sequelize
const sequelize = new Sequelize(process.env.PG_DATABASE, process.env.PG_USER, process.env.PG_PASSWORD, {
    host: process.env.PG_HOST,
    dialect: 'postgres',
    logging: false, // Désactiver les logs SQL
});

module.exports = sequelize;