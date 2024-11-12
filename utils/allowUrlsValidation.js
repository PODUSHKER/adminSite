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
            workerUrls.push(`/clientProfile/${activeTempData['ClientId']}`)
            workerUrls.push('/api/lockClientTool')
            workerUrls.push('/api/createSubscriptionTool')
            workerUrls.push('/api/deleteOneProduct')
        }
    }


    const worker = response.locals['thisWorker']
    if (worker && worker.role === "Worker") {
        if (workerUrls.includes(request.url)) {
            next()
            return
        }
        response.redirect('/')
    }
    next()
}

module.exports = allowUrlsValidation