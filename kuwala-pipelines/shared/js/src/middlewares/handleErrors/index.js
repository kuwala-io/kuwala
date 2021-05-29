const { GeneralError } = require('../../errors');

// eslint-disable-next-line no-unused-vars
const handleErrors = (error, req, res, next) => {
    console.error(`Request id: ${req.id}\n${error.stack}`);

    if (error instanceof GeneralError) {
        return res.status(error.code).json({
            success: false,
            error
        });
    }

    return res.status(500).json({
        success: false,
        error: {
            name: 'InternalServerError',
            message: error.message
        }
    });
};

module.exports = handleErrors;
