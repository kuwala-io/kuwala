const GeneralError = require('../generalError');

class MissingQueryParametersError extends GeneralError {
    constructor(missingQueryParameters) {
        super();

        this.code = 400;
        this.message = 'Required query parameters are missing';
        // noinspection JSUnusedGlobalSymbols
        this.missingQueryParameters = missingQueryParameters;
    }
}

module.exports = MissingQueryParametersError;
