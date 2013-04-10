var assert = require('assert'),
    dbConfigFile = __dirname + '/../couchdb-config-test.json',
    Model = require('../models/model.js').Model

describe('The Model class', function () {
    it('should read config information for the database', function (done) {
        Model.configTestDb(dbConfigFile, function (err, data) {
            assert(Model.prototype.database, 'model has a database property which is an URL');
            done(err, data);
        });
    });
    it('should create JsonClients', function () {
        var JsonClient = require('request-json').JsonClient,
            client = (new Model()).getClient();
        assert.equal(client.prototype, (new JsonClient()).prototype, 'getClient is a JsonClient');
    });
    it('should be able to be extended when receiving new data', function () {
        var model = new Model();
        model.extend({
            "new": "data",
            "from": "server"
        });
        assert.equal(model["new"], "data");
        assert.equal(model["from"], "server");
    });
});

describe('A class that inherits Model', function () {
    var model;

    before(function (done) {
        Model.configTestDb(dbConfigFile, done);
    });

    function SubModel() {
    }

    SubModel.prototype = new Model();
    SubModel.prototype.validate = function () {return true;};

    it('gets configuration from its parent classes', function () {
        var model = new Model(),
            subModel = new SubModel();
        assert(model.getClient(), '...on the model class');
        assert(subModel.getClient(), '...on the submodel class');
    });

    it('is able to save itself', function (done) {
        (new SubModel()).save(done);
    });

    it('gets id and rev from the db on save', function (done) {
        var model = new SubModel();
        model.save(function (err) {
            assert(!err);
            assert(model._rev);
            assert(model._id);
            done();
        });
    });

    it('is able to update (as opposed to save a new instance', function (done) {
        model = new SubModel();
        model.save(function (err) {
            assert(!err, err);
            model.aField = '123';
            model.save(function (err) {
                assert(!err, err);
                model.aField = 'something else';
                model.load(function (err) {
                    assert.equal(model.aField, '123');
                    done();
                });
            });
        });
    });

    it('Should validate before saving', function (done) {
        var model = new SubModel();
        model.validate = function () {return false};
        model.save(function (err, data) {
            assert(err, 'there should be a validation error here');
            model.validate = SubModel.prototype.validate;
            done();
        });
    });
    it('should load', function (done) {
        var model = new SubModel();
        model.someField = 'some-field';
        model.save(function (err, data) {
            model.someField = 'something else';
            assert(!err, err);
            model.load(function () {
                assert(!err, err);
                assert.equal(model.someField, 'some-field');
                done();
            });
        });
    });
    it('should delete', function (done) {
        var model = new SubModel();
        model.save(function (err, data) {
            assert(!err);
            assert(model._id);
            assert(model._rev);
            model.del(function (err) {
                if (err) return done(err);
                model.load(function (err) {
                    assert(err);
                    done();
                });
            });
        });
    });
    it('should pass these crazy tests', function (done) {
        var model = new SubModel();
        model.field1 = 'asd';
        model.save(function (err, data) {
            assert(!err);
            var model2 = new SubModel();
            model2._id = model._id;
            model2.load(function (err, data) {
                var id = model2._id,
                    rev = model2._rev;
                assert(!err, 'model.load returns no error');
                assert.equal(model2.field1, model.field1, 'model.load didn\'t preserve field1');
                assert.equal(model2.field1, 'asd', 'model.load didn\'t preserve field1');
                assert(id, 'model.load loads model id from server');
                assert(rev, 'model.load loads revision');
                model2.newField = 'newStuff';
                model2.save(function (err, data) {
                    assert(!err);
                    assert(model2._id == id);
                    assert(model2._rev !== rev);
                    model2.del(function (err, data) {
                        if (err) return done(err);
                        model2.load(function (err, data) {
                            assert(err);
                            done();
                        });
                    });
                });
            });
        });
    });
});
