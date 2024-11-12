const Sequelize = require('sequelize')

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'sitedb.db'
})

module.exports = { sequelize, DataTypes: Sequelize.DataTypes, }