var JsonClient = require('request-json').JsonClient,
    assert = require('assert'),
    Model = require('../models/model.js').Model;

describe('Trainer app', function () {
    var client = new JsonClient('http://localhost:8081');

    before(function (done) {
        var server = require('../server.js');
        Model.configTestDb(__dirname + '/../couchdb-config-test.json', function () {
            server.startListening(8081, done);
        });
    });

    it('should allow us to create trainers', function () {
        var trainerDoc = {
            email: 'some@email.com',
            username: 'someone',
            firstName: 'furst',
            lastName: 'last',
            password: 'mySecret',
        };
        client.post('/trainer', trainerDoc, function (err, res, data) {
            assert(!err, err);
            assert.equal(res.statusCode, 200);
            assert(data._id, 'server sends _id');
            assert(data._rev, 'server sends _rev');
            for (member in trainerDoc) {
                if (trainerDoc.hasOwnProperty(member)) {
                    assert.equal(data[member], trainerDoc[member], 'equal data as sent');
                    assert(data[member], 'not undefined');
                }
            }
            assert.equal(trainerDoc.email, data.email);
        });
    });
});
