class ValidationError extends Error {
    httpStatusCode = 422
}

module.exports = ValidationError