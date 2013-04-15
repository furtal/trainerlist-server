'use strict';
var Model = require('./model.js').Model;

function Event(initialData) {
    Model.call(this, initialData); // call the superclass.
}

Event.prototype = new Model();

// Do some regex to validate all the fields.
// Also make sure the required ones are there.
Event.prototype.validate = function () {
    // our date exists
    if (this.timestamp === undefined) {
        return false;
    }

    // our date is not an integer
    if (this.timestamp.toString() !== this.timestamp) {
        return false;
    }
    // our date string can be used to create a valid date with a valid amount of seconds 
    if (!new Date(this.timestamp).valueOf()) {
        return false;
    }

    return true;
};

module.exports.Event = Event;

