const TempData = require("../models/TempData")


async function allowUrlsValidation(request, response, next) {
    const workerUrls = [
        '/',
        '/registerClients',
        '/logout',
        '/api/findClientTool',
        '/api/resendCodeTool',
        '/api/confirmCodeTool'
    ]
    if (request.body['workerId']) {
        const activeTempData = await TempData.findOne({ where: { WorkerId: request.body['workerId'], isActive: true } })
        if (activeTempData) {
            const allowUrls = [
                `/clientProfile/${activeTempData['ClientId']}`,
                '/api/lockClientTool',
                '/api/createSubscriptionTool',
                '/api/deleteOneProduct',
                '/api/updateDeductCode',
                '/api/confirmDeductCode'
            ]
            console.log('is active tempdata')
            if (!allowUrls.includes(request.originalUrl)) {
                await TempData.destroy({ where: { id: activeTempData.id } })
            }
            else {
                allowUrls.forEach(el => {
                    workerUrls.push(el)
                })
            }
        }
    }


    const worker = response.locals['thisWorker']
    if (worker && worker.role === "Worker") {
        if (workerUrls.includes(request.originalUrl)) {
            next()
            return
        }
        response.redirect('/')
    }
    next()
}

module.exports = allowUrlsValidation