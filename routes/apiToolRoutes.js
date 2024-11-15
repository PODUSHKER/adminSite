const express = require('express')
const apiToolRouter = express.Router()
const apiToolControllers = require('../controllers/apiToolControllers.js')


apiToolRouter.post('/updateWorkerTool/:id', apiToolControllers.updateWorkerTool)
apiToolRouter.post('/updateWorkerPasswordTool/:id', apiToolControllers.updateWorkerPasswordTool)


apiToolRouter.post('/blockWorkerTool/:id', apiToolControllers.blockWorkerTool)
apiToolRouter.post('/unlockWorkerTool/:id', apiToolControllers.unlockWorkerTool)

apiToolRouter.post('/findClientTool', apiToolControllers.findClientTool)
apiToolRouter.post('/resendCodeTool', apiToolControllers.resendCodeTool)
apiToolRouter.post('/confirmCodeTool', apiToolControllers.confirmCodeTool)
apiToolRouter.post('/lockClientTool', apiToolControllers.lockClientTool)
apiToolRouter.post('/createSubscriptionTool', apiToolControllers.createSubscriptionTool)
apiToolRouter.post('/deleteOneProduct', apiToolControllers.deleteOneProduct)
apiToolRouter.post('/updateDeductCode', apiToolControllers.updateDeductCode)
apiToolRouter.post('/confirmDeductCode', apiToolControllers.confirmDeductCode)
apiToolRouter.post('/deleteTempData', apiToolControllers.deleteTempData)


module.exports = apiToolRouter