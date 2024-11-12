const { defaultValueSchemable } = require('sequelize/lib/utils')
const {sequelize, DataTypes} = require('../utils/dbSettings.js')

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

    code: {
        type: DataTypes.STRING,
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }

})

module.exports = TempData