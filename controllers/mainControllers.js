
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { Client, PlaceWork, Worker, TempData, Promo, Product, PromoProduct, Operation } = require('../models/associations.js')
const bot = require('../bots/confirmBot.js')
const { validationResult } = require('express-validator')

exports.getMain = async (request, response) => {
    const worker = response.locals['thisWorker']
    if (worker) {
        if (worker.role === 'Admin') {
            const clients = await Client.findAll({})
            const allPromos = [...(await Promo.findAll({}))]
            const promos = allPromos.filter(el => new Date().toLocaleDateString() === el.createdAt.toLocaleDateString())
            const sortWorkers = [...await Worker.findAll({})].sort(async (a, b) => {
                const bigger = (await Promo.findAll({ where: { WorkerId: b.id } })).length
                const smaller = (await Promo.findAll({ where: { WorkerId: b.id } })).length
                return bigger - smaller
            })
            topQuantity = 3;
            const topWorkers = sortWorkers.slice(0, topQuantity)
            const formatedTopWorkers = []
            for (let i of topWorkers) {
                const sells = (await Promo.findAll({ where: { WorkerId: i.id } })).length
                formatedTopWorkers.push({ workerFirstName: i.firstName, workerLastName: i.lastName, sells })
            }
            response.render('main.hbs', { cssFile: 'main', title: 'Главная', topWorkers: formatedTopWorkers, promos, clients })
        }
        else {
            response.render('workerMainPage.hbs', { cssFile: 'workerMainPage', title: 'Главная' })
        }
        return
    }
    response.redirect('/auth')
}

exports.getCreateWorker = async (request, response) => {
    const workers = await Worker.findAll({})
    const placeWorks = await PlaceWork.findAll({})
    response.render('createWorker.hbs', { cssFile: 'createWorker', title: 'Создать сотрудника', placeWorks })
}

exports.getWorkers = async (request, response) => {
    const workers = await Worker.findAll({})
    response.render('workers.hbs', { cssFile: 'workers', title: 'Сотрудники', workers })
}

exports.getWorkerProfile = async (request, response) => {
    console.log()
    const worker = await Worker.findOne({ where: { id: request.params['id'] }, include: PlaceWork })
    const placeWork = worker.PlaceWork
    const placeWorks = [...(await PlaceWork.findAll({}))].filter(el => el.id !== placeWork.id)
    response.render('workerProfile.hbs', { cssFile: 'workerProfile', title: 'Профиль сотрудника', worker, placeWork, placeWorks })
}

exports.getClients = async (request, response) => {
    let clients = await Client.findAll({})
    const pages = clients.length ? Math.ceil(clients.length / 10) : 0
    const page = request.query['page'] ? request.query['page'] : 1;

    if (pages > 1) {
        clients = clients.slice((10 * (page - 1)), (10 * page))
    }
    response.render('clients.hbs', { cssFile: 'clients', title: 'Клиенты', clients, pages, page })
}

exports.getClientProfile = async (request, response) => {
    const client = await Client.findOne({ where: { id: request.params['id'] }, include: Promo })
    if (response.locals['thisWorker'].role === 'Admin') {
        const tempData = await TempData.findOne({ where: { WorkerId: request.body['workerId'], ClientId: client.id, isActive: true } })
        if (!tempData) {
            await new TempData({ WorkerId: request.body['workerId'], ClientId: client.id, isActive: true }).save()
        }
    }
    let products, promo, promoProduct;
    if (client['PromoId']) {
        promo = client.Promo

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
    }
    let operations = await Operation.findAll({ where: { ClientId: client.id }, include: [Worker, Product] })
    operations = operations.length ? operations : null;

    const seconds = Number(process.env.TIMEOUT_SECONDS)
    response.render('clientProfile.hbs', { cssFile: 'clientProfile', title: 'Клиенты', client, products, promo, operations, seconds })
}

exports.postClientProfile = async (request, response) => {
    const client = await Client.findOne({ where: { id: request.params['id'] } })
    const errors = validationResult(request).errors
    if (errors.length) {
        response.cookie('errors', errors)
    }
    else {
        const { firstName, lastName, phone, telegramId } = request.body
        const tempData = await TempData.findOne({ where: { ClientId: client.id, isActive: true } })
        if (tempData) {
            client.firstName = firstName;
            client.lastName = lastName;
            client.phone = phone;
            client.telegramId = telegramId;
            await client.save()
        }
    }
    response.redirect(`/clientProfile/${client.id}`)
}

exports.postWorkerCreate = async (request, response) => {
    const errors = validationResult(request).errors
    if (errors.length) {
        response.cookie('errors', errors)
        response.redirect(request.originalUrl)
    }
    else {
        const { firstName, lastName, password, placeWork, phone } = request.body
        const telegramId = request.body['telegramId'].replace(/@/g, '')
        const salt = await bcrypt.genSalt(6)
        process.env.SALT = salt;
        const hash = await bcrypt.hash(password, salt)
        await new Worker({ firstName, lastName, password: hash, telegramId, PlaceWorkId: placeWork, phone }).save()
        response.redirect('/workers')
    }
}

exports.getWorkerMainPage = async (request, response) => {
    response.render('workerMainPage.hbs', { cssFile: 'workerMainPage', title: 'Найти Клиента' })
}

exports.getAuth = async (request, response) => {
    response.render('auth.hbs', { cssFile: 'auth', title: 'Авторизация', layout: false })
}

exports.postAuth = async (request, response) => {
    const errors = validationResult(request).errors
    if (errors.length) {
        response.cookie('errors', errors)
    }
    else {
        const { phone, password } = request.body
        const worker = await Worker.findOne({ where: { phone } })
        if (worker) {
            const verifyPassword = await bcrypt.compare(password, worker.password);
            if (verifyPassword) {
                const token = jwt.sign(
                    { workerId: worker.id },
                    process.env.SECRET_KEY,
                    { expiresIn: '24h' }
                )
                await response.cookie('token', `Bearer ${token}`)
                return response.redirect('/')
            }
        }
    }
    return response.redirect('/auth')

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

    const errors = validationResult(request).errors
    if (errors.length) {
        response.cookie('errors', errors)
        return response.redirect(request.originalUrl)
    }
    else {
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
                return response.redirect(`/clientProfile/${client.id}`)
            }
        }
        return response.redirect(`/`)
    }
}

exports.getCreatePlaceWork = async (request, response) => {

    response.render('createPlaceWork.hbs', { cssFile: 'createPlaceWork', title: 'Создать место работы' })
}

exports.postCreatePlaceWork = async (request, response) => {
    const errors = validationResult(request).errors
    if (errors.length) {
        response.cookie('errors', errors)
    }
    else {
        const { name, address } = request.body;
        await PlaceWork.create({ name, address })
    }
    response.redirect('/createPlaceWork')
}