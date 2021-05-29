const GeneralError = require('../generalError');

class MissingBodyParametersError extends GeneralError {
    constructor(missingBodyParameters) {
        super();

        this.code = 400;
        this.message = 'Required body parameters are missing';
        // noinspection JSUnusedGlobalSymbols
        this.missingBodyParameters = missingBodyParameters;
    }
}

module.exports = MissingBodyParametersError;
