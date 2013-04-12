'use strict';

var JsonClient = require('request-json').JsonClient,
    assert = require('assert'),
    Model = require('../models/model.js').Model;

function trainerFactory(data) {
    var defaults = {
            email: 'some@email.com',
            username: 'someone',
            firstName: 'furst',
            lastName: 'last',
        },
        key;
    for (key in data) {
        if (data.hasOwnProperty(key)) {
            defaults[key] = data[key];
        }
    }
    return defaults;
}

describe('Trainer app', function () {
    var client = new JsonClient('http://localhost:8081');

    before(function (done) {
        var server = require('../server.js');
        Model.configTestDb(__dirname + '/../couchdb-config-test.json', function () {
            server.startListening(8081, done);
        });
    });

    it('should allow us to create trainers', function (done) {
        var trainerDoc = trainerFactory({
            password: '12345'
        });
        client.post('/trainer', trainerDoc, function (err, res, data) {
            var member;
            assert(!err, err);
            assert.equal(res.statusCode, 200, res.statusCode);
            assert(data._id, 'server sends _id');
            assert(data._rev, 'server sends _rev');
            for (member in trainerDoc) {
                if (trainerDoc.hasOwnProperty(member)) {
                    if (member !== 'password') {
                        assert(trainerDoc[member]);
                        assert.equal(data[member], trainerDoc[member], 'equal data as sent');
                        assert(data[member], 'not undefined');
                    }
                }
            }
            assert.equal(trainerDoc.email, data.email);
            client.get('/trainer/' + data._id, done);
        });
    });

    it('should allow us to retrieve trainers', function (done) {
        var trainer = trainerFactory({
            password: '123456',
            username: 'someone'
        });
        client.post('/trainer', trainer, function (err, res, data) {
            assert(!err, err);
            client.get('/trainer/' + data._id, function () {
                assert(!err, err);
                assert.equal(data.username, 'someone');
                done();
            });
        });
    });

    it('should respond with 404 and error code on missing trainers', function (done) {
        client.get('/trainer/i-do-not-exist', function (err, res, json) {
            assert(json.error);
            assert.equal(res.statusCode, 404, res.statusCode);
            done();
        });
    });
});
