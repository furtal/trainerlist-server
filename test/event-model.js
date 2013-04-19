'use strict';
var assert = require('assert'),
    Event = require('../models/event.js').Event,
    Model = require('../models/model.js').Model,
    q = require('q'),
    nDays,
    xDays;

nDays = function (x) {
    var date = new Date();
    date.setDate(date.getDate() + x);
    return date
};

xDays = function (x) {
    return nDays(x).toISOString();
};

describe('Event model validations', function () {
    it('should validate required date field', function () {
        var ev = new Event({
            timestamp: new Date().toISOString(),
        });

        assert(ev.validate())

        ev.timestamp = undefined

        assert(!ev.validate())
    });

    it('should not accept anything that is not a valid ISO timestamp', function () {
        var ev = new Event({
            timestamp: +new Date()
        })

        assert(!ev.validate())

        ev.timestamp = '12-12-1234T12'

        assert(!ev.validate())
    });
});

describe('Event.pByTimestamp', function () {
    var events = [];
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
        cmd = __dirname + '/../node_modules/couchdb-update-views/cli.js'
        args = [
            '--config',
            __dirname + '/../couchdb-config-test.json',
            '--docsDir',
             __dirname + '/../design-documents/'
            ];
        child = spawn(cmd, args)
        child.stderr.pipe(process.stderr)
        child.stdout.pipe(process.stdout)
        child.on('exit', function (err) {
            assert.ok(!err)
            done()
        })
    });

    before(function (done) {
        q.all([
            new Event({timestamp: xDays(1), description: '1'}).pSave(),
            new Event({timestamp: xDays(2), description: '2'}).pSave()
        ])
        .then(function () {
            done();
        });
    });

    it('lets us get lists of events by timestamp', function (done) {
        var now = new Date(),
            time30HoursFromNow = new Date(),
            query;
        time30HoursFromNow.setHours(time30HoursFromNow.getHours() + 30);

        query = new Event(now, time30HoursFromNow)
        query.pByTimestamp().then(function (events) {
            assert.equal(events.length, 1);
            assert.equal(events[0].description, '1');
            done();
        })
    });

    it('gets by timestamp, sorted', function (done) {
        var query = new Event(nDays(0), nDays(10));
        query.pByTimestamp().then(function (events) {
            assert.equal(events[0].description, '1')
            assert.equal(events[1].description, '2')
            done();
        });
    });
});

