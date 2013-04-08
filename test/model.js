var assert = require('assert'),
    dbConfigFile = __dirname + '/../couchdb-config.json',
    Model = require('../models/model.js').Model

describe('The Model class', function () {
    it('should read config information for the database', function (done) {
        Model.configDb(dbConfigFile, function (err, data) {
            assert(Model.prototype.database, 'model has a database property which is an URL');
            done(err, data);
        });
    });
    it('should configTestDb for this test though', function (done) {
        Model.configTestDb(dbConfigFile, done);
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
    it('[config db]', function (done) {
        Model.configTestDb(dbConfigFile, done);
    });
    function SubModel() {
    }
    SubModel.prototype = new Model();
    SubModel.prototype.validate = function () {return true;};

    model = new SubModel();

    it('is able to save', function (done) {
        (new SubModel()).save(done);
    });

    it('gets id and rev from the db on save', function (done) {
        var model = new SubModel();
        model.save(function (err, data) {
            assert(!err);
            assert(model._rev);
            assert(model._id);
            done(err, data);
        });
    });

    it('is able to update (as opposed to save a new instance', function (done) {
        model = new SubModel();
        model._id = 'an-id';
        model.save(function (err, data) {

            assert.equal(data.id, 'an-id');
            assert.equal(data.id, model._id);
            done();
        });
    });

    it('Should validate before saving', function (done) {
        var model = new SubModel();
        model.validate = function () {return false};
        model.save(function (err, data) {
            assert(err);
            model.validate = SubModel.prototype.validate;
            model.save(done);
        });
        
    });
    it('should load', function (done) {
        var model = new SubModel();
        model._id = 'some-id';
        model.someField = 'some-field';
        model.save(function (err, data) {
            var model = new SubModel();
            assert(!err);
            model._id = 'some-id';
            model.load(function () {
                assert(!err);
                assert.equal(model._id, 'some-id');
                assert(model.someField);
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
