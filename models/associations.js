
const Promo = require('./Promo');
const Product = require('./Product');
const Client = require('./Client');
const Worker = require('./Worker.js')
const Operation = require('./Operation.js')
const PlaceWork = require('./PlaceWork.js')
const TempData = require('./TempData.js')
const PromoProduct = require('./PromoProduct.js')

Promo.hasMany(Client);
Client.belongsTo(Promo)

Promo.belongsToMany(Product, {through: PromoProduct});
Product.belongsToMany(Promo, {through: PromoProduct});

Product.hasMany(Operation)
Operation.belongsTo(Product)


PlaceWork.hasMany(Worker);
Worker.hasMany(Client);

Worker.hasMany(TempData);
TempData.belongsTo(Worker)

Worker.hasMany(Operation)
Operation.belongsTo(Worker)

Client.hasMany(TempData);
TempData.belongsTo(Client)

Client.hasMany(Operation)
Operation.belongsTo(Client)


module.exports = { Promo, Product, Client, Worker, PlaceWork, TempData, PromoProduct, Operation };