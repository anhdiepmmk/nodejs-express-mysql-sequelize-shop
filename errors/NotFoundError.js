class NotFoundError extends Error {
    constructor(message) {
      super(message); // (1)
      this.name = "NotFoundError"; // (2)
      this.httpStatusCode = 404
    }
  }


module.exports = NotFoundError