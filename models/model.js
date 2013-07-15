'use strict';
var assert = require('assert'),
    JsonClient = require('request-json').JsonClient,
    Q = require('q'),
    fs = require('fs'),
    errors = require('../errors.js');


exports.couchDbAddress = '';

exports.configDb = function (configFile, next) {
    fs.readFile(configFile, function (err, data) {
        if (err) next(err, null);
        data = JSON.parse(data).couch;
        exports.couchDbAddress = data.protocol + '://' + data.host + ':' + data.port + '/' + data.database;
        next(null, data);
    });
};

exports.configTestDb = function (configFile, next) {
    exports.configDb(configFile, function (err, data) {
        var client;
        if (err) return next(err, data);

        client = new JsonClient(exports.couchDbAddress);

        client.del('', function (err, res, body) {
            // Database may not exist yet, ignore errors
            client.put('', {}, function (err, res, body) {
                if (err) return next(err);
                if (body.error) return new Error(body.error);

                next(err, data);
            });
        });
    });
};

function _save(what, validator, next) {
    var client = new JsonClient(exports.couchDbAddress),
        then = function (err, res, data) {
            if (err) return next(err);
            if (data.error === 'conflict') return next(errors.outdated());
            if (data.error === 'bad_request') return next(errors.invalid(data.error.reason));
            if (data.error) return next(errors.fromCouchData(data));
            assert(data.ok);
            what._id = data.id;
            what._rev = data.rev;
            next(null, what);
        };
    if (validator && !validator(what)) {
        return next(errors.invalid());
    }
    if (what._id) {
        client.put('/' + what._id, what, then);
    } else {
        client.post('/', what, then);
    }
}

exports.pSave = function (model, options) {
    return Q.nfcall(_save, model, options && options.validator);
};

exports.extend = function (what, data) {
    // Extend model with data from couchDB.
    Object.keys(data).forEach(function (member) {
        what[member] = data[member];
    });
    return what;
};

exports.pLoad = function (id, options) {
    var client = new JsonClient(exports.couchDbAddress);
    return Q.nfcall(client.get.bind(client), '/' + id)  // TODO try invoke
        .then(function (result) {
            var res = result[0],
                data = result[1];
            if (res.statusCode === 404) throw errors.notFound();
            if (data.error) throw errors.fromCouchData(data);
            if (options.validator && !options.validator(data)) throw errors.invalid('the database returned an invalid object' + JSON.stringify(data));
            return data;
        });
};

exports.pDel = function (model, options) {
    var client = new JsonClient(exports.couchDbAddress),
        path = '/' + model._id + '?rev=' + encodeURIComponent(model._rev);
    return Q.nfcall(client.del.bind(client), path)
        .then(function (data) {
            if (data[1].error) throw errors.fromCouchData(data[1]);
            return data;
        });
};
