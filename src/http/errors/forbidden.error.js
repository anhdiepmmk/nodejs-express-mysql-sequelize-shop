class ForbiddenError extends Error {
    httpStatusCode = 403
    message = 'Forbidden.'

    constructor(message) {
        super(message)
        this.message = message
    }
}

module.exports = ForbiddenError