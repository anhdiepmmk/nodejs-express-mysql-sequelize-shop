class InternalServerError extends Error {
    httpStatusCode = 500
}

module.exports = InternalServerError