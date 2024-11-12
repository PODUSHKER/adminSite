const { options } = require('../routes/mainRoutes.js');
const {sequelize, DataTypes} = require('../utils/dbSettings.js')
const Worker = require('./Worker.js')


const PlaceWork = sequelize.define('PlaceWork', {

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

    address: {
        type: DataTypes.STRING,
        allowNull: false
    }

}, { timestamps: false })

// PlaceWork.hasMany(Worker)

module.exports = PlaceWork;