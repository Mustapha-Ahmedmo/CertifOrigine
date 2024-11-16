const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const LoginUser = sequelize.define('LoginUser', {
    ID_LOGIN_USER: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    USERNAME: {
        type: DataTypes.STRING(32),
        allowNull: false,
        unique: true,
    },
    PWD: {
        type: DataTypes.STRING(128),
        allowNull: false,
    },
    IsADMIN_LOGIN: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    DEACTIVATION_DATE: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal(`CURRENT_TIMESTAMP + INTERVAL '100 years'`),
    },
    LASTLOGIN_TIME: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'LOGIN_USER',
    timestamps: false, // Désactiver les colonnes createdAt/updatedAt
});

module.exports = LoginUser;