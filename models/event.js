'use strict';
var model = require('./model.js'),
    Model = model.Model,
    Q = require('q'),
    JsonClient = require('request-json').JsonClient,
    errors = require('../errors.js');

function Event(initialData) {
    // TODO remove
    if (arguments.length <= 1) {
        Model.call(this, initialData); // call the superclass.
    } else {
        Model.call(this);
        this.start = arguments[0].toISOString();
        this.end = arguments[1].toISOString();
    }
}

Event.prototype = new Model();

Event.prototype.byTimestamp = function (next) {
    // TODO remove
    return this.pByTimestamp().nodeify(next);
};

Event.prototype.pByTimestamp = function () {
    // TODO remove
    return exports.pByTimestamp(this.start, this.end);
};

exports.pEventByTimestamp /* << TODO remove */= exports.pByTimestamp = function (start, end) {
    var client = new JsonClient(model.couchDbAddress),
        path = '/_design/events/_view/by-timestamp',
        start = typeof start === 'string' ? start : start.toISOString(),
        end = typeof end === 'string' ? end : end.toISOString(),
        query = '?startkey="' + start + '"&endkey="' + end + '"';
    return Q.ninvoke(client, 'get', path + query)
        .then(function (result) {
            if (result[1].error) throw errors.fromCouchData(result[1]);
            return result[1].rows.map(function (row) {
                return row.value;
            });
        });
};

Event.prototype.validate = function () {
    // TODO remove
    return exports.validateEvent(this);
};

// Do some regex to validate all the fields.
// Also make sure the required ones are there.
exports.validateEvent = exports.validate = function (event) {
    // our date exists
    if (event.timestamp === undefined) {
        return false;
    }

    // the timestamp is not an int
    if (+event.timestamp === event.timestamp) {
        return false;
    }

    // our date string can be used to create a valid date with a valid amount of seconds 
    if (!new Date(event.timestamp).valueOf()) {
        return false;
    }

    return true;
};

exports.Event = Event;

