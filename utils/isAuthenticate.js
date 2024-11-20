const jwt = require('jsonwebtoken')
const Worker = require('../models/Worker.js')

async function isAuthenticate(request, response, next) {
    if (!['/auth', '/logout'].includes(request.url)) {
        console.log('in auth')
        if (request.cookies['token']) {
            const token = request.cookies['token'].split(' ')[1]
            const data = jwt.verify(token, process.env.SECRET_KEY)
            const worker = await Worker.findOne({ where: { id: data['workerId'] } })
            if (!worker.isBlock){
                console.log('in is block')
                request.body['workerId'] = data['workerId']
                response.locals['thisWorker'] = worker
                return next()
            }
            response.clearCookie('token')
        }
        return response.redirect('/auth')
    }
    return next()
}


module.exports = isAuthenticate