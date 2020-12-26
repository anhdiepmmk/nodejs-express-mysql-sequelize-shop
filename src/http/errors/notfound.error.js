class NotfoundError extends Error {
    httpStatusCode = 404
    message = "Not found."

    constructor(message) {
        super(message)
        this.message = message
    }
}

module.exports = NotfoundError