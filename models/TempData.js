const { defaultValueSchemable } = require('sequelize/lib/utils')
const { sequelize, DataTypes } = require('../utils/dbSettings.js')
const { all } = require('../routes/mainRoutes.js')

const TempData = sequelize.define('TempData', {

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },

    attempts: {
        type: DataTypes.INTEGER,
        defaultValue: 5
    },

    findCode: {
        type: DataTypes.STRING,
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    deductCode: {
        type: DataTypes.STRING,
        allowNull: true
    },


})

module.exports = TempData