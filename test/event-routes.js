'use strict';

var JsonClient = require('request-json').JsonClient,
    assert = require('assert'),
    Model = require('../models/model.js').Model,
    Trainer = require('../models/trainer.js').Trainer,
    Event = require('../models/event.js').Event,
    q = require('q');


describe('event app', function () {
    var client = new JsonClient('http://localhost:8081'),
        trainer = new Trainer({
            firstName: 'IAm',
            lastName: 'TrainerMan',
            username: 'trainerman',
            email: 'trainer@man.co',
            _id: 'trainerman-id',
        });

    before(function (done) {
        var server = require('../server.js');
        Model.configTestDb(__dirname + '/../couchdb-config-test.json', function () {
            server.startListening(8082, done);
        });
    });

    before(function (done) {
        var xDays = function (x) {
                // get ISO timestamp x days ahead of now.
                var ret = new Date();
                ret.setDate(ret.getDate() + x);
                return ret.toISOString();
            },
            events = [
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
                    description: 'event tomorrow',
                    timestamp: xDays(1),
                    trainer: 'trainerman-id',
                }),
                new Event({
                    description: 'event 2 days from now',
                    timestamp: xDays(2),
                    trainer: 'trainerman-id',
                }),
                new Event({
                    description: 'event of someone else',
                    timestamp: xDays(0),
                    trainer: 'someone-else',
                })
            ];

        trainer.pSave()
            .then(function () {
                var promises = [];
                events.forEach(function (evt) {
                    promises.push(evt.pSave());
                });
                return q.all(promises);
            })
            .then(function () {
                done();
            });
    });

    it('can retrieve latest events', function (done) {
        done(); // TODO
    });
});
