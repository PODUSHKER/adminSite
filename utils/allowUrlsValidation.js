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
    const worker = response.locals['thisWorker']
    if (worker) {
        const activeTempData = await TempData.findOne({ where: { WorkerId: request.body['workerId'], isActive: true } })
        if (activeTempData) {
            const allowUrls = [
                `/clientProfile/${activeTempData['ClientId']}`,
                '/api/lockClientTool',
                '/api/registerSubscriptionTool',
                '/api/updateSubscriptionTool',
                '/api/deleteOneProduct',
                '/api/updateDeductCode',
                '/api/confirmDeductCode',
                '/favicon.ico'
            ]
            if (!allowUrls.includes(request.originalUrl)) {
                await TempData.destroy({ where: { id: activeTempData.id } })
            }
            else {
                allowUrls.forEach(el => {
                    workerUrls.push(el)
                })
            }
        }
        if (worker.role === "Worker") {
            if (workerUrls.includes(request.originalUrl)) {
                return next()
            }
            return response.redirect('/')
        }
        if (worker.role === 'Admin') {
            return next()

        }
    }
    return next()
}

module.exports = allowUrlsValidation