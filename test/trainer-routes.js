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

    it('should let us update trainers', function (done) {
        var trainerDoc = trainerFactory({
                password: 'asd'
            }),
            updatedTrainerDoc;
        client.post('/trainer', trainerDoc, function (err, res, data) {
            assert(!err);
            updatedTrainerDoc = trainerFactory(data);
            updatedTrainerDoc.password = undefined;
            updatedTrainerDoc.lastName = 'lastname';
            client.post('/trainer/' + updatedTrainerDoc._id, updatedTrainerDoc, function (err, res, data) {
                assert(!err, err);
                assert(!data.error, data.error);
                assert.equal(data.lastName, 'lastname');
                done(null);
            });
        });
    });

    it('should fail creating when invalid info is given', function (done) {
        var trainer = trainerFactory({
                password: '123456',
                username: '1@2', // usernames cant have at-signs
            });
        client.post('/trainer', trainer, function (err, res, data) {
            assert(!err, err);
            assert.equal(res.statusCode, 400, 'status code of response should be 400');
            assert.equal(data.error, 'invalid');
            done();
        });
    });

    it('should fail updating when invalid info is given', function (done) {
        var trainer = trainerFactory({
                password: '123456',
            });
        client.post('/trainer', trainer, function (err, res, data) {
            assert(!err, err);

            data.email = 'invalid crap';
            client.post('/trainer/' + data._id, data, function (err, res, data) {
                assert(!err, err);
                assert.equal(res.statusCode, 400, 'status code should be 400, was ' + res.statusCode);
                assert.equal(data.error, 'invalid');
                done();
            });
        });
    });

    it('should yield status 409 on update conflicts', function (done) {
        var trainer = trainerFactory({password: 'asdasd'});
        client.post('/trainer', trainer, function (err, res, data) {
            data._rev = 'outdated-rev';
            client.post('/trainer/' + data._id, data, function (err2, res, data2) {
                assert.equal(res.statusCode, 409, 'statusCode should be 409, was ' + res.statusCode);
                done(err);
            });
        });
    });

    // TODO updating password

    it('should allow us to retrieve trainers', function (done) {
        var trainer = trainerFactory({
            password: '123456',
            username: 'someone'
        });
        client.post('/trainer', trainer, function (err, res, data) {
            assert(!err, err);
            client.get('/trainer/' + data._id, function (err, res, data) {
                assert(!err, err);
                assert.equal(data.username, 'someone');
                done();
            });
        });
    });

    it('should allow to delete trainers', function (done) {
        var trainer = trainerFactory({
            password: '123456'
        });
        client.post('/trainer', trainer, function (err, res, data) {
            assert(!err, err);
            client.post('/trainer/' + data._id + '/delete', {}, function (err, res, data) {
                assert(!err, err);
                assert(!data.error, data.error);
                assert.equal(res.statusCode, 200, res.statusCode);
                client.get('/trainer/' + trainer.id, function (err, res, data) {
                    assert(data.error === 'not_found');
                    done();
                });
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
