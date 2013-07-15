'use strict';
var assert = require('assert'),
    Event = require('../models/event.js').Event,
    event = require('../models/event.js'),
    Model = require('../models/model.js').Model,
    model = require('../models/model.js'),
    q = require('q'),
    xDays = require('../utils.js').relativeTimestamp;

describe('Event model validations', function () {
    it('should validate required date field', function () {
        var ev = {
            timestamp: new Date().toISOString(),
        };

        assert(event.validate(ev));
        ev.timestamp = undefined;
        assert(!event.validate(ev));
    });

    it('should not accept anything that is not a valid ISO timestamp', function () {
        var ev = {
            timestamp: +new Date()
        };

        assert(!event.validate(ev));
        ev.timestamp = '12-12-1234T12';
        assert(!event.validate(ev));
    });
});

describe('pByTimestamp', function () {
    before(function (done) {
        Model.configTestDb(
            __dirname + '/../couchdb-config-test.json',
            done);
    });

    before(function (done) {
        var spawn = require('child_process').spawn,
            cmd,
            args,
            child;
        cmd = 'node';
        args = [
            __dirname + '/../node_modules/couchdb-update-views/cli.js',
            '--config',
            __dirname + '/../couchdb-config-test.json',
            '--docsDir',
            __dirname + '/../design-documents/'
        ];
        child = spawn(cmd, args);
        child.stderr.pipe(process.stderr);

        child.on('exit', function (err) {
            done();
        });
    });

    before(function (done) {
        q.all([
            model.pSave({timestamp: xDays(1), description: '1'}),
            model.pSave({timestamp: xDays(2), description: '2'})
        ])
        .nodeify(done);
    });

    it('lets us get lists of events by timestamp', function (done) {
        var now = new Date(),
            time30HoursFromNow = new Date();
        time30HoursFromNow.setHours(time30HoursFromNow.getHours() + 30);

        event.pByTimestamp(now, time30HoursFromNow)
            .then(function (events) {
                assert.equal(events.length, 1);
                assert.equal(events[0].description, '1');
            }).nodeify(done);
    });

    it('gets by timestamp, sorted', function (done) {
        event.pByTimestamp(xDays(0), xDays(10))
            .then(function (events) {
                assert.equal(events[0].description, '1');
                assert.equal(events[1].description, '2');
            }).nodeify(done);
    });
});

