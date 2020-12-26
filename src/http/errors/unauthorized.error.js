class UnauthorizedError extends Error {
    httpStatusCode = 401

    constructor(message) {
        super(message)
        this.message = message
    }
}

module.exports = UnauthorizedError