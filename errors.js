// Error handler
'use strict';

module.exports.errorHandler = function (err, req, res, next) {
    var statusCode = err.statusCode || 500;
    res
        .status(statusCode)
        .json(err)
        .end();

    if (statusCode === 500 && err.stack) {
        console.log(err.stack);
    }
};

module.exports.notFound = function () {
    return {error: 'not_found', statusCode: 404};
};

module.exports.invalid = function () {
    return {error: 'invalid', statusCode: 400};
};

module.exports.outdated = function () {
    return {error: 'outdated', statusCode: 409};
};

