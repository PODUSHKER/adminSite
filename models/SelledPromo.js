const { sequelize, DataTypes } = require('../utils/dbSettings.js');

const SelledPromo = sequelize.define('SelledPromo', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },

    isEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },

    endDate: {
        type: DataTypes.DATE,
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

module.exports = SelledPromo;