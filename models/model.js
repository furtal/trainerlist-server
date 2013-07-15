'use strict';
var assert = require('assert'),
    JsonClient = require('request-json').JsonClient,
    Q = require('q'),
    fs = require('fs'),
    errors = require('../errors.js');

var functionCall = Function.prototype.call;

function Model(initialData) {
    if (initialData === Object(initialData)) {
        this.extend(initialData);
    } else if (initialData) {
        this._id = initialData;
    }
}

var couchDbAddress = exports.couchDbAddress = '';

Model.configDb = exports.configDb = function (configFile, next) {
    fs.readFile(configFile, function (err, data) {
        if (err) next(err, null);
        data = JSON.parse(data).couch;
        Model.prototype.database = couchDbAddress = exports.couchDbAddress = data.protocol + '://' + data.host + ':' + data.port + '/' + data.database;
        next(null, data);
    });
};

Model.configTestDb = exports.configTestDb = function (configFile, next) {
    Model.configDb(configFile, function (err, data) {
        var client;
        if (err) return next(err, data);

        client = new JsonClient(couchDbAddress);

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

Model.prototype.getClient = function () {
    // TODO remove
    assert(this.database);
    return new JsonClient(this.database);
};


function _save(what, validator, next) {
    var client = new JsonClient(couchDbAddress),
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

Model.prototype.save = function (next) {
    // TODO remove
    _save(this, functionCall.bind(this.validate), next);
};

Model.prototype.pSave = function () {
    // TODO remove
    return Q.nfcall(_save, this, functionCall.bind(this.validate));
};

exports.pSave = function (model, options) {
    return Q.nfcall(_save, model, options && options.validator);
};

exports.extend = function (what, data) {
    // TODO remove
    // Extend model with data from couchDB.
    Object.keys(data).forEach(function (member) {
        what[member] = data[member];
    });
    // Can I use http://underscorejs.org/#extend ?
};

Model.prototype.extend = function (data) {
    exports.extend.call({}, this, data);
};

Model.prototype.load = function (next) {
    // TODO remove
    var that = this;
    exports.pLoad(this._id, {})
        .then(function (data) {
            that.extend(data)
            return that;
        }).nodeify(next)
};

Model.prototype.pLoad = function () {
    // TODO remove
    return Q.ninvoke(this, 'load');
};

exports.pLoad = function (id, options) {
    var client = new JsonClient(couchDbAddress);
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

Model.prototype.del = function (next) {
    // TODO remove
    return exports.pDel(this).nodeify(next)
};

Model.prototype.pDel = function () {
    // TODO remove
    return Q.ninvoke(this, 'del');
};

exports.pDel = function (model, options) {
    var client = new JsonClient(couchDbAddress),
        path = '/' + model._id + '?rev=' + encodeURIComponent(model._rev);
    return Q.nfcall(client.del.bind(client), path)
        .then(function (data) {
            if (data[1].error) throw errors.fromCouchData(data[1]);
            return data;
        });
};

module.exports.Model = Model;
