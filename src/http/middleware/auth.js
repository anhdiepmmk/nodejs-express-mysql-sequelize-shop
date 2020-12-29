const jwt = require('jsonwebtoken')
const UnauthorizedError = require('../errors/unauthorized.error')

module.exports = (req, res, next) => {
    try {
        const authHeader = req.get('Authorization')

        if (!authHeader) {
            req.isAuth = false
            return next()
        }

        const token = authHeader.split(' ')[1]

        const decodedToken = jwt.verify(token, 'a-secret-string')

        if (!decodedToken) {
            req.isAuth = false
            return next()
        }

        req.userId = decodedToken.userId
        req.isAuth = true
        next()
    } catch (error) {
        req.isAuth = false
        return next()
    }
}