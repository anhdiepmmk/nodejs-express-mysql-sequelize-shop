class UnauthorizedError extends Error {
    constructor(message) {
      super(message); // (1)
      this.name = "UnauthorizedError"; // (2)
      this.httpStatusCode = 401
    }
  }


module.exports = NotFoundError