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
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    isBlock: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    telegramId: {
        type: DataTypes.STRING,
        defaultValue: ''
    },
})



module.exports = Client