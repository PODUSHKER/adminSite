
const Promo = require('./Promo');
const Product = require('./Product');
const Client = require('./Client');
const Worker = require('./Worker.js')
const Operation = require('./Operation.js')
const PlaceWork = require('./PlaceWork.js')
const TempData = require('./TempData.js')
const PromoProduct = require('./PromoProduct.js')
const SelledPromo = require('./SelledPromo.js')
const ProductToSell = require('./ProductToSell.js')

SelledPromo.hasMany(Client);
Client.belongsTo(SelledPromo, { onDelete: 'SET NULL' })

SelledPromo.belongsToMany(ProductToSell, { through: PromoProduct });
ProductToSell.belongsToMany(SelledPromo, { through: PromoProduct });

ProductToSell.hasMany(Operation)
Operation.belongsTo(ProductToSell, { foreignKey: { onDelete: 'CASCADE' } })


PlaceWork.hasMany(Worker);
Worker.belongsTo(PlaceWork, { foreignKey: { allowNull: true }, onDelete: 'SET NULL' })

Worker.hasMany(Client);
Client.belongsTo(Worker, { onDelete: 'SET NULL' })

Promo.hasMany(SelledPromo)
SelledPromo.belongsTo(Promo, { onDelete: 'CASCADE' })

Worker.hasMany(SelledPromo)
SelledPromo.belongsTo(Worker) //TODO

Worker.hasMany(TempData);
TempData.belongsTo(Worker, { onDelete: 'CASCADE' })

Worker.hasMany(Operation)
Operation.belongsTo(Worker, { onDelete: 'CASCADE' })

Client.hasMany(TempData);
TempData.belongsTo(Client, { onDelete: 'CASCADE' })

ProductToSell.hasMany(TempData)
TempData.belongsTo(ProductToSell, { onDelete: 'CASCADE' })

Client.hasMany(Operation)
Operation.belongsTo(Client, { onDelete: 'CASCADE' })

Product.hasMany(ProductToSell);
ProductToSell.belongsTo(Product, { onDelete: 'CASCADE' })

Promo.hasMany(Product)
Product.belongsTo(Promo, { onDelete: 'CASCADE' })


module.exports = {
    SelledPromo,
    ProductToSell,
    Client,
    Worker,
    PlaceWork,
    TempData,
    PromoProduct,
    Operation,
    Promo,
    Product
};