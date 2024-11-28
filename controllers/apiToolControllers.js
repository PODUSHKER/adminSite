const bcrypt = require('bcrypt')
const { Worker, Client, TempData, Promo, Product, PromoProduct, Operation } = require('../models/associations.js')
const genCode = require('../utils/genCode.js')
const bot = require('../bots/confirmBot.js')
const { validationResult } = require('express-validator')

exports.updateWorkerTool = async (request, response) => {
    const errors = validationResult(request).errors
    if (errors.length) {
        response.cookie('errors', errors)
    }
    else {
        const { firstName, lastName, phone, placeWork } = request.body
        const telegramId = request.body['telegramId'].replace(/@/g, '')
        await Worker.update({ firstName, lastName, phone, placeWork, telegramId }, { where: { id: request.params['id'] } })
    }
    response.end()
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
    response.end()
}


exports.blockWorkerTool = async (request, response) => {
    await Worker.update({ isBlock: true }, { where: { id: request.params['id'] } })
    response.end()
}
exports.unlockWorkerTool = async (request, response) => {
    await Worker.update({ isBlock: false }, { where: { id: request.params['id'] } })
    response.end()
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
    response.json(message)
}

exports.resendCodeTool = async (request, response) => {
    const code = genCode()
    const { workerId } = request.body
    const tempData = await TempData.findOne({ where: { WorkerId: workerId }, include: Client })
    tempData.findCode = code;
    await tempData.save()
    const telegramUserId = tempData.Client.telegramUserId;
    bot.sendMessage(telegramUserId, `Код подтверждения входа: ${code}`)
    response.json({ code })
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
    response.end()
}


exports.createSubscriptionTool = async (request, response) => {
    const tempData = await TempData.findOne({ WorkerId: request.body['workerId'], isActive: true })
    if (tempData) {
        const timeToLive = 30;
        const today = new Date()
        const endDate = today.setDate(today.getDate() + timeToLive)
        const promo = await new Promo({ title: 'Стандарт', price: 1500, discount: 10, timeToLive, endDate, WorkerId: tempData.WorkerId }).save()
        await Client.update({ PromoId: promo.id }, { where: { id: tempData.ClientId } })


        const cofe = await new Product({ name: 'Кофе' }).save()
        const cola = await new Product({ name: 'Кола' }).save()
        await PromoProduct.create({ PromoId: promo.id, ProductId: cofe.id })
        await PromoProduct.create({ PromoId: promo.id, ProductId: cola.id })

        const products = [
            cofe,
            cola,
        ]
        response.json({ subscription: promo, products })
    }
    response.end()
}

exports.updateSubscriptionTool = async (request, response) => {
    const promo = await Promo.findOne({ where: {WorkerId: request.body['workerId']}})
    if (promo){
        promo.isEnabled = true;
        promo.endDate = new Date().setDate(new Date().getDate()+30);
        const promoProducts = [...(await PromoProduct.findAll({where: {PromoId: promo.id}}))]
        const products = [];
        for (let el of promoProducts){
            const product = await Product.findOne({where: {id: el.ProductId}})
            product.quantity=5
            await product.save()
            products.push(product)
        }
            
        
        await promo.save()
        return response.json({subscription: promo, products})
    }
    response.json({})
}

exports.deleteOneProduct = async (request, response) => {
    const tempData = await TempData.findOne({ where: { WorkerId: request.body['workerId'], isActive: true }, include: [Client, Worker, Product] })
    if (tempData) {
        const product = tempData.Product
        product.quantity--;
        await product.save()
        await Operation.create({ ClientId: tempData.ClientId, WorkerId: tempData.WorkerId, ProductId: tempData.ProductId })
        tempData.ProductId = null;
        tempData.deductCode = null;
        await tempData.save()
        const operation = { Worker: tempData.Worker, Product: product, createdAt: new Date().toLocaleDateString() }
        response.json({ name: product.name, quantity: product.quantity, operation })
    }
    response.end()
}


exports.updateDeductCode = async (request, response) => {
    const { workerId, productId } = request.body;
    const code = genCode()
    const tempData = await TempData.findOne({ where: { WorkerId: workerId, isActive: true }, include: [Client, Product] })
    const product = productId ? await Product.findOne({ where: { id: productId } }) : tempData.Product
    if (tempData.ProductId !== product.id) {
        tempData.ProductId = product.id
    }
    tempData.deductCode = code
    await tempData.save()

    bot.sendMessage(tempData.Client.telegramUserId, `Товар: ${product.name}\nКод подтверждения списания: ${code}`)

}

exports.confirmDeductCode = async (request, response) => {
    const { workerId, inCode } = request.body
    const result = { isSuccess: false, productId: '' }
    const tempData = await TempData.findOne({ where: { WorkerId: workerId, isActive: true } })
    if (tempData) {
        if (tempData.deductCode === inCode) {
            result.isSuccess = true
            result.productId = tempData.ProductId
            await tempData.save()
        }
    }
    response.json(result)
}

exports.deleteTempData = async (request, response) => {
    const tempData = await TempData.findOne({ where: { WorkerId: request.body['workerId'], isActive: true } })
    if (tempData) {
        await TempData.destroy({ where: { id: tempData } })
    }
    response.end()
}