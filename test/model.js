'use strict';
var assert = require('assert'),
    dbConfigFile = __dirname + '/../couchdb-config-test.json',
    model = require('../models/model.js'),
    JSONClient = require('request-json').JSONClient;

describe('The model module', function () {
    it('should read config information for the database', function (done) {
        model.configTestDb(dbConfigFile, function (err, data) {
            assert(model.couchDbAddress, 'model has a database property which is an URL');
            done(err, data);
        });
    });
    it('should be able to be extended when receiving new data', function () {
        var m = model.extend({original: 'stuff'}, {
            "new": "data",
            "from": "server"
        });
        assert.equal(m['new'], "data");
        assert.equal(m.from, "server");
        assert.equal(m.original, 'stuff');
    });
});

