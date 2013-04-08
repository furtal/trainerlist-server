var assert = require('assert'),
    JsonClient = require('request-json').JsonClient,
    fs = require('fs');

function Model() {}

Model._configDb = function (configFile, next) {
    fs.readFile(configFile, function (err, data) {
        if (err) {
            return next(err, null);
        }
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
            // Database may not exist yet
            client.put('', {}, function (err, res, body) {
                if (err) return next(err);
                if (res.error) throw new Error(body.body);
            });
        });
        next(err, data);
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
        that._id = data.id;
        that._rev = data.rev;
        next(err, data);
    };
    if (!this.validate()) {
        return next('Validation Error');
    }
    if (this._id) {
        client.put(this.getPath(), this, then);
    } else {
        client.post('/', this, then);
    }
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
        if (res.statusCode !== 200) return next('not found');
        that.extend(body);
        next(err, body);
    });
};

Model.prototype.del = function (next) {
    var client = this.getClient()
    client.del(this.getPath(), function (err, res, body) {
        if (body.error) return next(new Error(body.error));
        next(err, body);
    });
};

module.exports.Model = Model;