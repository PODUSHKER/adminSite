const express = require('express')
const mainRouter = express.Router()
const mainControllers = require('../controllers/mainControllers.js')

mainRouter.get('', mainControllers.getMain)
mainRouter.get('/workers', mainControllers.getWorkers)
mainRouter.get('/workerProfile/:id', mainControllers.getWorkerProfile)

mainRouter.get('/clients', mainControllers.getClients)

mainRouter.get('/clientProfile/:id', mainControllers.getClientProfile)
mainRouter.post('/clientProfile/:id', mainControllers.postClientProfile)

mainRouter.get('/createWorker', mainControllers.getCreateWorker)
mainRouter.post('/createWorker', mainControllers.postWorkerCreate)

mainRouter.get('/workerMainPage', mainControllers.getWorkerMainPage)

mainRouter.get('/auth', mainControllers.getAuth)
mainRouter.post('/auth', mainControllers.postAuth)
mainRouter.get('/logout', mainControllers.logout)

mainRouter.get('/registerClients', mainControllers.getRegisterClients)
mainRouter.post('/registerClients', mainControllers.postRegisterClients)

mainRouter.get('/createPlaceWork', mainControllers.getCreatePlaceWork)
mainRouter.post('/createPlaceWork', mainControllers.postCreatePlaceWork)

module.exports = mainRouter