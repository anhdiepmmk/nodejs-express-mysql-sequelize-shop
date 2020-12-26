const jwt = require('jsonwebtoken')
const UnauthorizedError = require('../errors/unauthorized.error')

module.exports = (req, res, next) => {
    try {
        const authHeader = req.get('Authorization')

        if (!authHeader) {
            throw new UnauthorizedError('Authorization header not found.')
        }

        const token = authHeader.split(' ')[1]

        const decodedToken = jwt.verify(token, 'a-secret-string')

        if (!decodedToken) {
            throw new UnauthorizedError('Token is invalid.')
        }

        req.userId = decodedToken.userId

        next()
    } catch (error) {
        next(error)
    }
}