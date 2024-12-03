const { sequelize, DataTypes } = require('../utils/dbSettings.js')

const ProductToSell = sequelize.define('ProductToSell', {

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },

    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 5
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },

})



module.exports = ProductToSell