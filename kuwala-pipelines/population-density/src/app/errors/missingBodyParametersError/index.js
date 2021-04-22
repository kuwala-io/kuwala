class MissingBodyParametersError extends Error {
    constructor(missingBodyParameters) {
        super();

        this.name = this.constructor.name;
        this.code = 400;
        this.message = 'Required body parameters are missing';
        // noinspection JSUnusedGlobalSymbols
        this.missingBodyParameters = missingBodyParameters;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = MissingBodyParametersError;
