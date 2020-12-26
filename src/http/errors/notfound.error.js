class NotfoundError extends Error {
    httpStatusCode = 404
    message = "The requested resource could not be found but may be available in the future. Subsequent requests by the client are permissible."
}

module.exports = NotfoundError