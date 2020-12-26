class ValidationError extends Error {
    httpStatusCode = 422

    constructor(message) {
        super(message)
        this.message = message
    }
}

module.exports = ValidationError