'use strict';
var assert = require('assert'),
    Event = require('../models/event.js').Event;

describe('Event model validations', function () {
    it('should validate required date field', function () {
        var ev = new Event({
            timestamp: new Date().toISOString(),
        });

        assert(ev.validate())

        ev.timestamp = undefined

        assert(!ev.validate())
    });

    it('should not accept anything that is not a valid timestamp', function () {
        var ev = new Event({
            timestamp: +new Date()
        })

        assert(!ev.validate())

        ev.timestamp = '12-12-1234T12'

        assert(!ev.validate())
    });
});
