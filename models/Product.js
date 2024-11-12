const {sequelize, DataTypes} = require('../utils/dbSettings.js')

const Product = sequelize.define('Product', {

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 5
    },


})



module.exports = Product