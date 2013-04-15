// Error handler
'use strict';

module.exports.errorHandler = function (err, req, res, next) {
    res
        .status(err.statusCode || 500)
        .json(err)
        .end();
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

