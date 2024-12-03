const express = require('express')
const apiToolRouter = express.Router()
const apiToolControllers = require('../controllers/apiToolControllers.js')
const {
    editWorkerProfileValidators,
    editWorkerPasswordValidators
} = require('../utils/validators.js')

apiToolRouter.post('/updateWorkerTool/:id', editWorkerProfileValidators, apiToolControllers.updateWorkerTool)
apiToolRouter.post('/updateWorkerPasswordTool/:id', editWorkerPasswordValidators, apiToolControllers.updateWorkerPasswordTool)
apiToolRouter.post('/blockWorkerTool/:id', apiToolControllers.blockWorkerTool)
apiToolRouter.post('/unlockWorkerTool/:id', apiToolControllers.unlockWorkerTool)

apiToolRouter.post('/findClientTool', apiToolControllers.findClientTool)

apiToolRouter.post('/resendCodeTool', apiToolControllers.resendCodeTool)
apiToolRouter.post('/confirmCodeTool', apiToolControllers.confirmCodeTool)

apiToolRouter.post('/lockClientTool', apiToolControllers.lockClientTool)

apiToolRouter.post('/registerSubscriptionTool', apiToolControllers.registerSubscriptionTool)
apiToolRouter.post('/updateSubscriptionTool', apiToolControllers.updateSubscriptionTool)

apiToolRouter.post('/createProductTool', apiToolControllers.createProductTool)

apiToolRouter.post('/deleteOneProduct', apiToolControllers.deleteOneProduct)
apiToolRouter.post('/updateDeductCode', apiToolControllers.updateDeductCode)
apiToolRouter.post('/confirmDeductCode', apiToolControllers.confirmDeductCode)
apiToolRouter.post('/deleteTempData', apiToolControllers.deleteTempData)

apiToolRouter.post('/deleteProduct/:id', apiToolControllers.deleteParentProduct)


module.exports = apiToolRouter