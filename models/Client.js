const { UniqueConstraintError } = require('sequelize')
const {sequelize, DataTypes} = require('../utils/dbSettings.js')

const Client = sequelize.define('Client', {

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    isBlock: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    telegramId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    telegramUserId: {
        type: DataTypes.STRING,
        allowNull: false
    }
})



module.exports = Client