const { sequelize, DataTypes } = require('../utils/dbSettings.js')
const Client = require('./Client.js')


const Worker = sequelize.define('Worker', {
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
    role: {
        type: DataTypes.STRING,
        defaultValue: 'Worker'
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    telegramId: {
        type: DataTypes.STRING,
        defaultValue: ''
    },
    isBlock: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
})



module.exports = Worker

