class ValidationError extends Error {
    constructor(message) {
      super(message); // (1)
      this.name = "ValidationError"; // (2)
      this.httpStatusCode = 422
    }
  }


module.exports = ValidationError