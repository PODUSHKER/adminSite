

async function initCookieParams(request, response, next) {
    const { errors } = request.cookies;
    response.clearCookie('errors')
    response.locals['errors'] = errors
    next()
}

module.exports = initCookieParams