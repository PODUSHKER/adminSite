
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { Client, PlaceWork, Worker, TempData, Promo, Product, PromoProduct, Operation } = require('../models/associations.js')
const bot = require('../bots/confirmBot.js')


exports.getMain = async (request, response) => {
    const worker = response.locals['thisWorker']
    if (worker) {
        if (worker.role === 'Admin') {
            response.render('main.hbs', { cssFile: 'main', title: 'Главная' })
        }
        else {
            response.render('workerMainPage.hbs', { cssFile: 'workerMainPage', title: 'Главная' })
        }
    }
}


exports.getCreateWorker = async (request, response) => {
    const workers = await Worker.findAll({})
    console.log('workers', workers)
    const placeWorks = await PlaceWork.findAll({})
    console.log('placeWorks', placeWorks)
    response.render('createWorker.hbs', { cssFile: 'createWorker', title: 'Создать сотрудника', placeWorks })
}

exports.getWorkers = async (request, response) => {
    const workers = await Worker.findAll({})
    response.render('workers.hbs', { cssFile: 'workers', title: 'Сотрудники', workers })
}

exports.getWorkerProfile = async (request, response) => {
    const worker = await Worker.findOne({ where: { id: request.params['id'] } })
    const placeWork = await PlaceWork.findOne({ where: { id: worker.PlaceWorkId } })
    const placeWorks = [...(await PlaceWork.findAll({}))].filter(el => el.id !== placeWork.id)
    response.render('workerProfile.hbs', { cssFile: 'workerProfile', title: 'Профиль сотрудника', worker, placeWork, placeWorks })
}

exports.getClients = async (request, response) => {
    let clients = await Client.findAll({})
    const pages = clients.length ? Math.ceil(clients.length / 10) : 0
    const page = request.query['page'] ? request.query['page'] : 1;

    console.log('pre clients ebaaat', clients)
    if (pages > 1) {
        clients = clients.slice((10 * (page - 1)), (10 * page))
    }
    console.log(clients)
    response.render('clients.hbs', { cssFile: 'clients', title: 'Клиенты', clients, pages, page })
}
exports.getClientProfile = async (request, response) => {
    const client = await Client.findOne({ where: { id: request.params['id'] } })
    if (response.locals['thisWorker'].role === 'Admin') {
        const tempData = await TempData.findOne({ where: { WorkerId: request.body['workerId'], ClientId: client.id, isActive: true } })
        if (!tempData) {
            await new TempData({ WorkerId: request.body['workerId'], ClientId: client.id, isActive: true }).save()
        }
    }
    let products, promo, promoProduct;
    if (client['PromoId']) {
        promo = await Promo.findOne({ where: { id: client.PromoId } })

        if (new Date() >= promo.endDate) {
            promo.isEnabled = false
            await promo.save()
        }

        promoProduct = [...(await PromoProduct.findAll({ where: { PromoId: promo.id } }))]

        if (promo.isEnabled) {
            products = []
            for (let el of promoProduct) {
                const product = await Product.findOne({ where: { id: el.ProductId } })
                products.push(product)
            }
            products = products.filter(el => el.quantity > 0)
        }
        else {
            for (let el of promoProduct) {
                await Product.destroy({ where: { id: el.ProductId } })
            }
        }
    }
    let operations = await Operation.findAll({ where: { ClientId: client.id }, include: [Worker, Product] })
    operations = operations.length ? operations : null;

    const seconds = Number(process.env.TIMEOUT_SECONDS)
    response.render('clientProfile.hbs', { cssFile: 'clientProfile', title: 'Клиенты', client, products, promo, operations, seconds})
}

exports.postClientProfile = async (request, response) => {
    const { firstName, lastName, phone, telegramId } = request.body
    const client = await Client.findOne({ where: { id: request.params['id'] } })
    const tempData = await TempData.findOne({ where: { ClientId: client.id, isActive: true } })
    if (tempData) {
        client.firstName = firstName;
        client.lastName = lastName;
        client.phone = phone;
        client.telegramId = telegramId.replace(/[^a-z0-9_-]/gi, '')
        await client.save()
    }
    response.redirect(`/clientProfile/${client.id}`)
}



exports.postWorkerCreate = async (request, response) => {
    const { firstName, lastName, password, placeWork, phone } = request.body
    const telegramId = request.body['telegramId'].replace(/@/g, '')
    const salt = await bcrypt.genSalt(6)
    process.env.SALT = salt;
    const hash = await bcrypt.hash(password, salt)
    await new Worker({ firstName, lastName, password: hash, telegramId, PlaceWorkId: placeWork, phone }).save()
    response.redirect('/workers')
}


exports.getWorkerMainPage = async (request, response) => {
    response.render('workerMainPage.hbs', { cssFile: 'workerMainPage', title: 'Найти Клиента' })
}


exports.getAuth = async (request, response) => {
    response.render('auth.hbs', { cssFile: 'auth', title: 'Авторизация', layout: false })
}


exports.postAuth = async (request, response) => {
    const { phone, password } = request.body
    const worker = await Worker.findOne({ where: { phone } })
    if (worker) {
        console.log('has worker')
        const verifyPassword = await bcrypt.compare(password, worker.password);
        if (verifyPassword) {
            console.log('verify password')
            const token = jwt.sign(
                { workerId: worker.id },
                process.env.SECRET_KEY,
                { expiresIn: '24h' }
            )
            console.log('im here')
            console.log(token)
            await response.cookie('token', `Bearer ${token}`)
            response.redirect('/')
            return
        }
    }
    response.redirect('/auth')

}


exports.logout = (request, response) => {
    response.clearCookie('token')
    response.redirect('/auth')
}


exports.getRegisterClients = (request, response) => {
    response.render('registerClients.hbs', { cssFile: 'registerClients', title: 'Создание клиента' })
}


exports.postRegisterClients = async (request, response) => {
    const { firstName, lastName, phone, telegramId, workerId } = request.body

    const client = await Client.findOne({ where: { telegramId } })
    const worker = response.locals['thisWorker']
    if (client) {
        if (!client.WorkerId) {
            client.phone = phone
            client.WorkerId = workerId
            client.firstName = firstName
            client.lastName = lastName
            await client.save()
            bot.sendMessage(client.telegramUserId, 'Вы успешно зарегистрированы!')
        }

        let tempData = await TempData.findOne({ where: { isActive: true } })
        if (!tempData) {
            tempData = await new TempData({ ClientId: client.id, WorkerId: worker.id, isActive: true }).save()
            response.redirect(`/clientProfile/${client.id}`)
        }
    }
    response.redirect(`/`)
}


exports.getCreatePlaceWork = async (request, response) => {
    response.render('createPlaceWork.hbs', { cssFile: 'createPlaceWork', title: 'Создать место работы' })
}


exports.postCreatePlaceWork = async (request, response) => {
    const { name, address } = request.body;
    await PlaceWork.create({ name, address })
    response.redirect('/createPlaceWork')
}