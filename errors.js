// Error handler
'use strict';

module.exports = function errorHandler(err, req, res, next) {
    res
        .status(err.statusCode || 500)
        .json(err)
        .end();
};
