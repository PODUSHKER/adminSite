const jwt = require('jsonwebtoken')
const Worker = require('../models/Worker.js')

async function isAuthenticate(request, response, next) {
    if (!['/auth', '/logout'].includes(request.url)) {
        if (request.cookies['token']) {
            const token = request.cookies['token'].split(' ')[1]
            const data = jwt.verify(token, process.env.SECRET_KEY)
            const worker = await Worker.findOne({ where: { id: data['workerId'] } })
            if (!worker.isBlock){
                request.body['workerId'] = data['workerId']
                response.locals['thisWorker'] = worker
                next()
                return
            }
            response.clearCookie('token')
        }
        response.redirect('/auth')
    }
    next()
}


module.exports = isAuthenticate