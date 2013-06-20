'use strict';
var model = require('./model.js'),
    Model = model.Model,
    q = require('q'),
    JsonClient = require('request-json').JsonClient,
    errors = require('../errors.js');

function Event(initialData) {
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
    var client = this.getClient(),
        path = '/_design/events/_view/by-timestamp',
        query = '?startkey="' + this.start + '"&endkey="' + this.end + '"';
    client.get(path + query, function (err, res, data) {
        var ret;
        if (err) return next(err);
        if (data.error) return next(new Error(data));
        ret = data.rows.map(function (row) {
            return new Event(row.value);
        });
        return next(null, ret);
    });
};

Event.prototype.pByTimestamp = function () {
    return q.nfcall(this.byTimestamp.bind(this));
};

exports.pEventByTimestamp = function (start, end) {
    var client = new JsonClient(model.couchDbAddress),
        path = '/_design/events/_view/by-timestamp',
        query = '?startkey="' + start.toISOString() + '"&endkey="' + end.toISOString() + '"';
    q.ninvoke(client, 'get', path + query)
        .then(function (result) {
            var data = result[1];
            if (data.error) throw errors.fromCouchData(data);
            return data.rows;
        });
};

// Do some regex to validate all the fields.
// Also make sure the required ones are there.
Event.prototype.validate = function () {
    // our date exists
    if (this.timestamp === undefined) {
        return false;
    }

    // the timestamp is not an int
    if (+this.timestamp === this.timestamp) {
        return false;
    }

    // our date string can be used to create a valid date with a valid amount of seconds 
    if (!new Date(this.timestamp).valueOf()) {
        return false;
    }

    return true;
};

exports.validateEvent = function (event) {
    return Event.prototype.validate.call(event);
};

exports.Event = Event;

