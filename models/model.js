var assert = require('assert'),
    JsonClient = require('request-json').JsonClient,
    Q = require('q'),
    fs = require('fs');

function Model() {}

Model._configDb = function (configFile, next) {
    fs.readFile(configFile, function (err, data) {
        if (err) next(err, null);
        data = JSON.parse(data).couch;
        Model.prototype.database = data.protocol + '://' + data.host + ':' + data.port + '/' + data.database;
        next(null, data);
    });
};

Model.configDb = Model._configDb;

Model.configTestDb = function (configFile, next) {
    Model._configDb(configFile, function (err, data) {
        var client;
        if (err) return next(err, data);
        Model.prototype.database += '-test'
        client = Model.prototype.getClient();

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
    assert(this.database);
    return new JsonClient(this.database);
};

Model.prototype.getPath = function () {
    assert(this._id);
    return '/' + this._id;
};

Model.prototype.save = function (next) {
    var client = this.getClient(),
        that = this,
        validation,
        then;
    then = function (err, res, data) {
        if (err) return next(err);
        if (data.error) return next(new Error(data.error));
        assert(data.id || data._id);
        assert(data.rev || data._rev);
        that._id = data.id || data._id;
        that._rev = data.rev || data._rev;
        next(null, data);
    };
    if (!this.validate()) {
        return next(new Error('validation_error'));
    }
    if (this._id) {
        client.put(this.getPath(), this, then);
    } else {
        client.post('/', this, then);
    }
};

Model.prototype.pSave = function () {
    return Q.nfcall(this.save.bind(this));
};

Model.prototype.extend = function (data) {
    // Extend model with data from couchDB.
    var member;
    for (member in data) {
        this[member] = data[member];
    }
}

Model.prototype.load = function (next) {
    var client = this.getClient(),
        that = this;
    client.get(this.getPath(), function (err, res, body) {
        if (err) return next(err);
        if (body.error) return next(new Error(body.error));
        if (res.statusCode !== 200) return next('not found');
        that.extend(body);
        next(null, body);
    });
};

Model.prototype.pLoad = function () {
    return Q.nfcall(this.load.bind(this));
};

Model.prototype.del = function (next) {
    var client = this.getClient(),
        delUrl = this.getPath() + '?rev=' + encodeURIComponent(this._rev);
    client.del(delUrl, function (err, res, body) {
        if (body.error) return next(new Error(body.error));
        if (err) return next(err);
        return next(null, body);
    });
};

Model.prototype.pDel = function (next) {
    return Q.nfcall(this.del.bind(this));
};

module.exports.Model = Model;
