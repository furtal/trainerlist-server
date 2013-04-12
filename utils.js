'use strict';

function respondJSON(response, object) {
    response.setHeader('Content-Type', 'application/json');
    response.write(JSON.stringify(object));
    response.end();
}

module.exports.respondJSON = respondJSON;
