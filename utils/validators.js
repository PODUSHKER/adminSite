const { body } = require('express-validator')
const { PlaceWork, Worker, Client, TempData } = require('../models/associations.js')
const bcrypt = require('bcrypt')

const placeWorkValidators = [
    body('name').custom(async (value, { req }) => {
        if (value) {
            const placeWork = await PlaceWork.findOne({ where: { name: value } })
            if (placeWork) {
                throw new Error('Такое место работы уже существует!')
            }
        }
        else {
            throw new Error('Введите название!')
        }
    }),
    body('address').custom(async (value, { req }) => {
        if (value) {
            const placeWork = await PlaceWork.findOne({ where: { address: value } })
            if (placeWork) {
                throw new Error('Такое место работы уже существует!')
            }
        }
        else {
            throw new Error('Введите адрес!')
        }
    }),
]


const createWorkerValidators = [
    body('firstName').notEmpty().withMessage('Введите имя!'),
    body('lastName').notEmpty().withMessage('Введите фамилию!'),
    body('phone').custom(async (value, { req }) => {
        if (value) {
            const isValid = value.match(/\+7\d{10}/)
            if (isValid) {
                const phone = isValid[0]
                const worker = await Worker.findOne({ where: { phone } })
                if (worker) {
                    throw new Error('Номер телефона уже занят!')
                }
            }
            else {
                throw new Error('Неверный формат номера телефона!')
            }
        }
        else {
            throw new Error('Введите номер телефона!')
        }
    }),
    body('password').custom(async (value, { req }) => {
        if (value) {
            if (value !== req.body['confirmPassword']) {
                throw new Error('Пароли не совпадают!')
            }
        }
        else {
            throw new Error('Введите пароль!')
        }
    })
]

const createClientValidators = [
    body('firstName').notEmpty().withMessage('Введите имя!'),
    body('lastName').notEmpty().withMessage('Введите фамилию!'),
    body('phone').custom(async (value, { req }) => {
        if (value) {
            const isValid = value.match(/\+7\d{10}/)
            if (isValid) {
                const phone = isValid[0]
                const client = await Client.findOne({ where: { phone } })
                if (client) {
                    throw new Error('Номер телефона уже занят!')
                }
            }
            else {
                throw new Error('Неверный формат номера телефона!')
            }
        }
        else {
            throw new Error('Введите номер телефона!')
        }
    }),
    body('telegramId').custom(async (value, { req }) => {
        if (value) {
            const isValid = value.match(/^[a-z0-9_-]+$/gi)
            if (isValid) {
                const telegramId = isValid[0]
                const client = await Client.findOne({ where: { telegramId } })
                if (client && client.WorkerId) {
                    throw new Error('Такой телеграм ID уже занят!')
                }
            }
            else {
                throw new Error('Телеграм ID неверного формата!')
            }
        }
        else {
            throw new Error('Введите телеграм ID!')
        }
    })
]


const editWorkerProfileValidators = [
    body('firstName').notEmpty().withMessage('Введите имя!'),
    body('lastName').notEmpty().withMessage('Введите фамилию!'),
    body('phone').custom(async (value, { req }) => {
        if (value) {
            const isValid = value.match(/\+7\d{10}/)
            if (isValid) {
                const phone = isValid[0]
                const thisWorker = await Worker.findOne({where: {id: req.body['workerId']}})
                const worker = await Worker.findOne({ where: { phone } })
                if (worker && worker.id !== thisWorker.id) {
                    throw new Error('Номер телефона уже занят!')
                }
            }
            else {
                throw new Error('Неверный формат номера телефона!')
            }
        }
        else {
            throw new Error('Введите номер телефона!')
        }
    }),
]

const editWorkerPasswordValidators = [
    body('password').custom(async (value, { req }) => {
        if (value) {
            if (value !== req.body['passwordConfirm']) {
                throw new Error('Пароли не совпадают!')
            }
        }
        else {
            throw new Error('Введите пароль!')
        }
    })
]


const editClientValidators = [
    body('phone').custom(async (value, { req }) => {
        if (value) {
            const isValid = value.match(/\+7\d{10}/)
            if (isValid) {
                const phone = isValid[0]
                const tempData = await TempData.findOne({where: {WorkerId: req.body['workerId'], isActive: true}, include: Client})
                const client = await Client.findOne({ where: { phone } })
                if (client && tempData.Client.id !== client.id) {
                    throw new Error('Номер телефона уже занят!')
                }
            }
            else {
                throw new Error('Неверный формат номера телефона!')
            }
        }
        else {
            throw new Error('Введите номер телефона!')
        }
    }),
    body('telegramId').custom(async (value, { req }) => {
        if (value) {
            const isValid = value.match(/^[a-z0-9_-]+$/gi)
            if (isValid) {
                const telegramId = isValid[0]
                const tempData = await TempData.findOne({where: {WorkerId: req.body['workerId'], isActive: true}, include: Client})
                const client = await Client.findOne({ where: { telegramId } })
                if (client && tempData.Client.id !== client.id) {
                    throw new Error('Такой телеграм ID уже занят!')
                }
            }
            else {
                throw new Error('Телеграм ID неверного формата!')
            }
        }
        else {
            throw new Error('Введите телеграм ID!')
        }
    })
]


const loginWorkerValidators = [
    body('phone').custom(async (value, { req }) => {
        if (value) {
            const worker = await Worker.findOne({ where: { phone: value } })
            if (!worker) {
                throw new Error('Неверный номер телефона или пароль!')
            }
        }
        else {
            throw new Error('Введите номер телефона!')
        }
    }),
    body('password').custom(async (value, { req }) => {
        if (value) {
            const worker = await Worker.findOne({ where: { phone: req.body['phone'] } })
            if (worker) {
                const isValid = await bcrypt.compare(value, worker.password)
                if (!isValid) {
                    throw new Error('Неверный номер телефона или пароль!')
                }
            }
        }
        else{
            throw new Error('Введите пароль!')
        }
    })
]


module.exports = {
    placeWorkValidators,
    createClientValidators,
    createWorkerValidators,
    editClientValidators,
    editWorkerProfileValidators,
    editWorkerPasswordValidators,
    loginWorkerValidators
}