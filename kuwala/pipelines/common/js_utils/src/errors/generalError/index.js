class GeneralError extends Error {
    constructor(message) {
        super();

        this.name = this.constructor.name;
        this.message = message;
        this.code = 500;
        Error.captureStackTrace(this, this.constructor);
    }
}
module.exports = GeneralError;
