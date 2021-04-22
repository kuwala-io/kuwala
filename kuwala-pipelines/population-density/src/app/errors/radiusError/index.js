class RadiusError extends Error {
    constructor() {
        super();

        this.name = this.constructor.name;
        this.code = 400;
        this.message =
            'The provided radius is too small for the resolution of the queried cell';
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = RadiusError;
