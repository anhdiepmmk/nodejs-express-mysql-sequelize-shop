class InternalServerError extends Error {
    httpStatusCode = 500

    constructor(message) {
        super(message)
        this.message = message
    }
}

module.exports = InternalServerError