const bcrypt = require('bcrypt')
const { Worker, Client, TempData, Promo, Product, PromoProduct, Operation, PlaceWork, SelledPromo, ProductToSell } = require('../models/associations.js')
const genCode = require('../utils/genCode.js')
const bot = require('../bots/confirmBot.js')
const { validationResult } = require('express-validator')
const { raw } = require('express')
const { options } = require('../routes/mainRoutes.js')

exports.updateWorkerTool = async (request, response) => {
    const errors = validationResult(request).errors
    if (errors.length) {
        response.cookie('errors', errors)


    }
    else {

        const { firstName, lastName, phone, placeWork } = request.body
        const telegramId = request.body['telegramId'].replace(/@/g, '')
        const resultPlaceWork = placeWork || undefined
        await Worker.update({ firstName, lastName, phone, PlaceWorkId: resultPlaceWork, telegramId }, { where: { id: request.params['id'] } })
        worker = await Worker.findOne({ where: { id: request.params['id'] } })


    }

    return response.end()
}


exports.updateWorkerPasswordTool = async (request, response) => {
    const errors = validationResult(request).errors
    if (errors.length) {
        response.cookie('errors', errors)
    }
    else {
        const saltGrain = Number(process.env.SALT_GRAIN)
        const salt = await bcrypt.genSalt(saltGrain)
        const hash = await bcrypt.hash(request.body['password'], salt)
        await Worker.update({ password: hash }, { where: { id: request.params['id'] } })
    }
    return response.end()
}


exports.blockWorkerTool = async (request, response) => {
    await Worker.update({ isBlock: true }, { where: { id: request.params['id'] } })
    return response.end()
}
exports.unlockWorkerTool = async (request, response) => {
    await Worker.update({ isBlock: false }, { where: { id: request.params['id'] } })
    return response.end()
}



exports.findClientTool = async (request, response) => {
    const phone = request.body['phone']
    const client = await Client.findOne({ where: { phone } })
    const message = { success: false, html: '', code: '' }
    if (client) {
        const code = genCode()

        bot.sendMessage(client.telegramUserId, `Код подтверждения входа: ${code}`)

        let hasTempData = await TempData.findOne({ where: { WorkerId: request.body['workerId'] } })
        if (!hasTempData) {
            hasTempData = new TempData({ WorkerId: request.body['workerId'], ClientId: client.id })
        }
        hasTempData.findCode = code;
        await hasTempData.save()

        message['success'] = true
        message['html'] =
            `
        <div id="sms-code-block">
            <label for="smsCode" class="reg-label">Введите SMS-код:</label>
            <input type="text" id="smsCode" name="smsCode" placeholder="Введите код" class="reg-input">

            <div class="sms-actions">
                <button type="button" class="btn sms-btn">Отправить код еще раз</button>
                <button type="button" class="btn reg-btn"">Подтвердить</button>
            </div>

            <p class="attempts">Попытки: <span id="attemptCount">${hasTempData.attempts}</span></p>
        </div>
        `
    }
    return response.json(message)
}

exports.resendCodeTool = async (request, response) => {
    const code = genCode()
    const { workerId } = request.body
    const tempData = await TempData.findOne({ where: { WorkerId: workerId }, include: Client })
    tempData.findCode = code;
    await tempData.save()
    const telegramUserId = tempData.Client.telegramUserId;
    bot.sendMessage(telegramUserId, `Код подтверждения входа: ${code}`)
    return response.json({ code })
}

exports.confirmCodeTool = async (request, response) => {
    const { workerId, code } = request.body
    const tempData = await TempData.findOne({ where: { WorkerId: workerId } })
    if (tempData.attempts) {
        if (tempData.findCode !== code) {
            tempData.attempts--
            await tempData.save()
            response.json({ attemps: tempData.attempts })
            return
        }
        tempData.isActive = true
        await tempData.save()
        response.redirect(`/clientProfile/${tempData['ClientId']}`)
        return
    }
    await Worker.update({ isBlock: true }, { where: { id: workerId } })
    await TempData.destroy({ where: { id: tempData.id } })
    response.clearCookie('token')
    response.redirect('/auth')
}


exports.lockClientTool = async (request, response) => {
    const tempData = await TempData.findOne({ where: { WorkerId: request.body['workerId'], isActive: true }, include: Client })
    if (tempData) {
        const client = tempData.Client
        client.isBlock = !Number(client.isBlock)
        await client.save()
    }
    return response.end()
}


exports.registerSubscriptionTool = async (request, response) => {
    const tempData = await TempData.findOne({ WorkerId: request.body['workerId'], isActive: true })
    if (tempData) {
        const { subscriptionId } = request.body;

        const subscription = await Promo.findOne({ where: { id: subscriptionId } })
        const { title, price, discount, timeToLive } = subscription;

        const today = new Date()
        const endDate = today.setDate(today.getDate() + timeToLive)

        const promo = await new SelledPromo({ title, price, discount, timeToLive, endDate, WorkerId: tempData.WorkerId, PromoId: subscriptionId }).save()
        tempData['SelledPromoId'] = promo.id;
        await tempData.save()

        await Client.update({ SelledPromoId: promo.id }, { where: { id: tempData.ClientId } })

        const products = await Product.findAll({ where: { PromoId: subscriptionId } })

        for (let i = 0; i < products.length; i++) {
            products[i] = await new ProductToSell({ ProductId: products[i].id, PromoId: promo.id, quantity: products[i].quantity, name: products[i].name }).save()
            await PromoProduct.create({ SelledPromoId: promo.id, ProductToSellId: products[i].id })
        }

        response.json({ subscription: promo, products })
    }
    return response.end()
}

exports.updateSubscriptionTool = async (request, response) => {
    const tempData = await TempData.findOne({ where: { WorkerId: request.body['workerId'] }, include: Client })
    const promo = await SelledPromo.findOne({ where: { id: tempData.Client.SelledPromoId } })

    if (promo) {

        promo.isEnabled = true;
        
        promo.endDate = new Date().setDate(new Date().getDate() + +promo.timeToLive);
        const promoProducts = [...(await PromoProduct.findAll({ where: { SelledPromoId: promo.id } }))]
        const products = [];
        for (let el of promoProducts) {
            const product = await ProductToSell.findOne({ where: { id: el.ProductToSellId }, include: Product })
            product.quantity = product.Product.quantity
            await product.save()
            products.push(product)
        }


        await promo.save()



        return response.json({ subscription: promo, products })
    }
    return response.json({})
}

exports.deleteOneProduct = async (request, response) => {
    const tempData = await TempData.findOne({ where: { WorkerId: request.body['workerId'], isActive: true }, include: [Client, Worker, ProductToSell] })
    if (tempData) {
        const product = tempData.ProductToSell
        product.quantity--;
        await product.save()
        await Operation.create({ ClientId: tempData.ClientId, WorkerId: tempData.WorkerId, ProductToSellId: tempData.ProductToSellId })
        tempData.ProductToSellId = null;
        tempData.deductCode = null;
        await tempData.save()
        const operation = { Worker: tempData.Worker, ProductToSell: product, createdAt: new Date().toLocaleDateString() }
        response.json({ name: product.name, quantity: product.quantity, operation })
    }
    return response.end()
}


exports.updateDeductCode = async (request, response) => {
    const { workerId, productId } = request.body;
    const code = genCode()
    const tempData = await TempData.findOne({ where: { WorkerId: workerId, isActive: true }, include: [Client, ProductToSell] })
    const product = productId ? await ProductToSell.findOne({ where: { id: productId } }) : tempData.ProductToSell
    if (tempData.ProductToSellId !== product.id) {
        tempData.ProductToSellId = product.id
    }
    tempData.deductCode = code
    await tempData.save()

    bot.sendMessage(tempData.Client.telegramUserId, `Товар: ${product.name}\nКод подтверждения списания: ${code}`)
    return response.end()
}

exports.confirmDeductCode = async (request, response) => {
    const { workerId, inCode } = request.body
    const result = { isSuccess: false, productId: '' }
    const tempData = await TempData.findOne({ where: { WorkerId: workerId, isActive: true } })
    if (tempData) {
        if (tempData.deductCode === inCode) {
            result.isSuccess = true
            result.productId = tempData.ProductToSellId
            await tempData.save()
        }
    }
    return response.json(result)
}

exports.deleteTempData = async (request, response) => {
    const tempData = await TempData.findOne({ where: { WorkerId: request.body['workerId'], isActive: true } })
    if (tempData) {
        await TempData.destroy({ where: { id: tempData } })
    }
    return response.end()
}

exports.createProductTool = async (request, response) => {
    const { name, quantity } = request.body;

    const product = await new Product({ name, quantity, PromoId: undefined }).save()
    return response.json({ product })
}


exports.deleteParentProduct = async (request, response) => {

    await Product.destroy({ where: { id: request.params['id'] } })
    return response.end()
}