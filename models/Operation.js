const { sequelize, DataTypes } = require('../utils/dbSettings.js')

const Operation = sequelize.define('Operation', {

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },

})

module.exports = Operation;