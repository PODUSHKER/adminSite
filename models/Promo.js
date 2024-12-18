const { sequelize, DataTypes } = require('../utils/dbSettings.js')
const Client = require('./Client.js')
const Product = require('./Product.js')

const Promo = sequelize.define('Promo', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    discount: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    timeToLive: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    price: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
})



module.exports = Promo