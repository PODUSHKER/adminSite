const { sequelize, DataTypes } = require('../utils/dbSettings.js')

const PromoProduct = sequelize.define('PromoProduct', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    }
}, { timestamps: false })


module.exports = PromoProduct;