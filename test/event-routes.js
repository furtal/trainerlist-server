'use strict';

var JsonClient = require('request-json').JsonClient,
    assert = require('assert'),
    Model = require('../models/model.js').Model,
    model = require('../models/model.js'),
    Trainer = require('../models/trainer.js').Trainer,
    trainer = require('../models/trainer.js'),
    Event = require('../models/event.js').Event,
    event = require('../models/event.js'),
    q = require('q'),
    xDays = require('../utils.js').relativeTimestamp;

var trainerOptions = {validator: trainer.validateTrainer};
var eventOptions = {validator: event.validateEvent};

describe('event app', function () {
    var client = new JsonClient('http://localhost:8082'),
        mock = {
            firstName: 'IAm',
            lastName: 'TrainerMan',
            username: 'trainerman',
            email: 'trainer@man.co',
            _id: 'trainerman-id',
        };

    before(function (done) {
        var server = require('../server.js');
        Model.configTestDb(__dirname + '/../couchdb-config-test.json', function () {
            server.startListening(8082, done);
        });

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
            assert.ok(!err, err);
            done();
        });
    });

    before(function (done) {
        var events = [
                new Event({
                    description: 'event far behind',
                    timestamp: xDays(-32),
                    trainer: 'trainerman-id',
                }),
                new Event({
                    description: 'past event 1',
                    timestamp: xDays(-3),
                    trainer: 'trainerman-id',
                }),
                new Event({
                    description: 'past event 2',
                    timestamp: xDays(-6),
                    trainer: 'trainerman-id',
                }),
                new Event({
                    description: 'event occurring now',
                    timestamp: new Date().toISOString(),
                    trainer: 'trainerman-id',
                }),
                new Event({
                    description: 'event tomorrow',
                    timestamp: xDays(1),
                    trainer: 'trainerman-id',
                }),
                new Event({
                    description: 'event 2 days from now',
                    timestamp: xDays(2),
                    trainer: 'trainerman-id',
                }),
                /*new Event({
                    description: 'event of someone else',
                    timestamp: xDays(0),
                    trainer: 'someone-else',
                })*/ // TODO
            ];
        
        model.pSave(mock)
            .then(function () {
                var promises = [];
                events.forEach(function (evt) {
                    promises.push(model.pSave(evt));  // TODO isn't this map()?
                });
                return q.all(promises);
            })
            .then(function () {
                done();
            });
    });

    it('can retrieve upcoming events', function (done) {
        client.get('/events/upcoming/trainerman-id', function (err, res, data) {
            var descriptions;
            assert(!err, err);
            assert(!data.error, data.error);
            assert.equal(res.statusCode, 200);
            assert.equal(data.length, 3, data.length);
            descriptions = data.map(function (val) {
                return val.description;
            });
            assert.deepEqual(descriptions, [
                'event occurring now',
                'event tomorrow',
                'event 2 days from now'
            ]);
            done();
        });
    });

    it('can retrieve past events', function (done) {
        client.get('/events/past/trainerman-id', function (err, res, data) {
            var descriptions;
            assert.equal(res.statusCode, 200, res.statusCode);
            assert.equal(data.length, 3)
            descriptions = data.map(function (val) {
                return val.description;
            });
            assert.deepEqual(descriptions, [
                'event occurring now',
                'past event 1',
                'past event 2'
            ]);
            done();
        });
    });

    it('allows to create events', function (done) {
        var evt = new Event({
            timestamp: new Date(),
            description: 'some description',
        });
        client.post('/events/trainerman-id/create', evt, function (err, res, data) {
            var created;
            assert(!err, err);
            assert.equal(res.statusCode, 200, res.statusCode);

            created = new Event(data._id)

            assert.equal(data.timestamp, evt.timestamp.toISOString());
            assert.equal(data.description, evt.description);

            created.pLoad()
                .then(function () {
                    done();
                })
                .fail(done);
        })
    });
});

