const bcrypt = require('bcrypt')
const { Worker, Client, TempData, Promo, Product, PromoProduct, Operation } = require('../models/associations.js')
const genCode = require('../utils/genCode.js')


exports.updateWorkerTool = async (request, response) => {
    const { firstName, lastName, phone, placeWork } = request.body
    const telegramId = request.body['telegramId'].replace(/@/g, '')
    await Worker.update({ firstName, lastName, phone, placeWork, telegramId }, { where: { id: request.params['id'] } })
    response.end()
}


exports.updateWorkerPasswordTool = async (request, response) => {
    const saltGrain = Number(process.env.SALT_GRAIN)
    const salt = await bcrypt.genSalt(saltGrain)
    const hash = await bcrypt.hash(request.body['password'], salt)
    await Worker.update({ password: hash }, { where: { id: request.params['id'] } })
    response.end()
}


exports.blockWorkerTool = async (request, response) => {
    console.log('im in block', request.params['id'])
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
        let hasTempData = await TempData.findOne({ where: { WorkerId: request.body['workerId'] } })
        if (!hasTempData) {
            hasTempData = new TempData({ WorkerId: request.body['workerId'], ClientId: client.id })
        }
        hasTempData.code = code;
        await hasTempData.save()

        message['success'] = true
        message['code'] = code
        message['html'] =
            `
        <div id="sms-code-block">
            <label for="smsCode" class="reg-label">Введите SMS-код:</label>
            <p id="secretCode">${code}</p>
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
    const worker = await Worker.findOne({ where: { id: request.body['workerId'] } })
    await TempData.update({ code }, { where: { WorkerId: worker.id } })
    response.json({ code })
}

exports.confirmCodeTool = async (request, response) => {
    const { workerId, code } = request.body
    const tempData = await TempData.findOne({ where: { WorkerId: workerId } })
    if (tempData.attempts) {
        if (tempData.code !== code) {
            tempData.attempts--
            await tempData.save()
            response.json({ attemps: tempData.attempts })
            return
        }
        tempData.isActive = true
        await tempData.save()
        const seconds = Number(process.env.TIMEOUT_SECONDS)
        console.log(seconds)
        setTimeout(async () => {
            await TempData.destroy({ where: { id: tempData.id } })
        }, seconds * 1000)
        //TODO check promo timeout
        response.redirect(`/clientProfile/${tempData['ClientId']}`)
        return
    }
    await Worker.update({ isBlock: true }, { where: { id: workerId } })
    await TempData.destroy({ where: { id: tempData.id } })
    response.clearCookie('token')
    response.redirect('/auth')
}


exports.lockClientTool = async (request, response) => {
    const tempData = await TempData.findOne({ WorkerId: request.body['workerId'], isActive: true })
    if (tempData) {
        const client = await Client.findOne({ where: { id: tempData.ClientId } })
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
        const promo = await new Promo({ title: 'Стандарт', price: 1500, discount: 10, timeToLive, endDate }).save()
        await Client.update({ PromoId: promo.id }, { where: { id: tempData.ClientId } })
        const cofe = await new Product({ name: 'Кофе' }).save()
        const cola = await new Product({ name: 'Кола' }).save()
        await PromoProduct.create({ PromoId: promo.id, ProductId: cofe.id })
        await PromoProduct.create({ PromoId: promo.id, ProductId: cola.id })
        response.json({ subscription: promo, cofe, cola })
    }
    response.end()
}

exports.deleteOneProduct = async (request, response) => {
    const tempData = await TempData.findOne({ where: { WorkerId: request.body['workerId'], isActive: true }, include: [Client, Worker] })
    if (tempData) {
        const product = await Product.findOne({ where: { id: request.body['id'] } })
        product.quantity--;
        await product.save()
        console.log('im in product information')
        console.log(tempData)
        await Operation.create({ClientId: tempData.Client.id, WorkerId: tempData.Worker.id, ProductId: product.id})
        const operation = {Worker: tempData.Worker, Product: product, createdAt: new Date().toLocaleDateString()}
        response.json({ name: product.name, quantity: product.quantity, operation})
    }
    response.end()
}