'use strict';

function respondJSON(response, object) {
    response.setHeader('Content-Type', 'application/json');
    response.write(JSON.stringify(object));
    response.end();
}

function relativeTimestamp(nDays) {
    var ret = new Date();
    ret.setDate(ret.getDate() + nDays);
    return ret;
}

module.exports.relativeTimestamp = relativeTimestamp;

module.exports.respondJSON = respondJSON;
