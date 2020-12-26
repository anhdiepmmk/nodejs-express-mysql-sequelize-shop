class UnauthorizedError extends Error {
    httpStatusCode = 401
}

module.exports = UnauthorizedError