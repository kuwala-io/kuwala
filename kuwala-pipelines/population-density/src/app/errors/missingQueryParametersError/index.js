class MissingQueryParametersError extends Error {
    constructor(missingQueryParameters) {
        super();

        this.name = this.constructor.name;
        this.code = 400;
        this.message = 'Required query parameters are missing';
        // noinspection JSUnusedGlobalSymbols
        this.missingQueryParameters = missingQueryParameters;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = MissingQueryParametersError;
