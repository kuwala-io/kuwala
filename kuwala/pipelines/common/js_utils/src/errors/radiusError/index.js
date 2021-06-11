const GeneralError = require('../generalError');

class RadiusError extends GeneralError {
    constructor() {
        super();

        this.code = 400;
        this.message =
            'The provided radius is too small for the resolution of the queried cell';
    }
}

module.exports = RadiusError;
