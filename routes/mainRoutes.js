const express = require('express')
const mainRouter = express.Router()
const mainControllers = require('../controllers/mainControllers.js')
const {
    createWorkerValidators,
    createClientValidators,
    editClientValidators,
    loginWorkerValidators,
    placeWorkValidators,
    createSubscription
} = require('../utils/validators.js')

mainRouter.get('', mainControllers.getMain)
mainRouter.get('/workers', mainControllers.getWorkers)
mainRouter.get('/workerProfile/:id', mainControllers.getWorkerProfile)

mainRouter.get('/clients', mainControllers.getClients)

mainRouter.get('/clientProfile/:id', mainControllers.getClientProfile)
mainRouter.post('/clientProfile/:id', editClientValidators, mainControllers.postClientProfile)

mainRouter.get('/createWorker', mainControllers.getCreateWorker)
mainRouter.post('/createWorker', createWorkerValidators, mainControllers.postWorkerCreate)

mainRouter.get('/workerMainPage', mainControllers.getWorkerMainPage)

mainRouter.get('/auth', mainControllers.getAuth)
mainRouter.post('/auth', loginWorkerValidators, mainControllers.postAuth)
mainRouter.get('/logout', mainControllers.logout)

mainRouter.get('/registerClients', mainControllers.getRegisterClients)
mainRouter.post('/registerClients', createClientValidators, mainControllers.postRegisterClients)

mainRouter.get('/createPlaceWork', mainControllers.getCreatePlaceWork)
mainRouter.post('/createPlaceWork', placeWorkValidators, mainControllers.postCreatePlaceWork)

mainRouter.get('/createSubscription', mainControllers.getCreateSubscription)
mainRouter.post('/createSubscription', createSubscription, mainControllers.postCreateSubscription)

mainRouter.get('/subscriptions', mainControllers.getSubscriptions)

mainRouter.get('/deleteSubscription/:id', mainControllers.deleteSubscription)

module.exports = mainRouter