'use strict';

var assert = require('assert'),
    Trainer = require('../models/trainer.js').Trainer,
    trainer = require('../models/trainer.js'),
    model = require('../models/model.js');

function trainerFactory(fields) {
    var mock = {};
    fields = fields || {};
    mock.email = fields.email || 'a.valid@email.com';
    mock.username = fields.username || 'valid.username';
    mock.firstName = fields.firstName || 'First';
    mock.lastName = fields.lastName || 'Last';
    return mock;
}

describe('Trainer model', function () {
    it('[testing trainerFactory defaults]', function () {
        var mock = trainerFactory();
        assert.equal(trainer.validate(mock), true);
    });
    it('should validate missing fields', function () {
        var fields = ['email', 'username', 'firstName', 'lastName'],
            mock,
            fieldName,
            result,
            i;
        for (i = 0; i < fields.length; i += 1) {
            fieldName = fields[i];
            mock = trainerFactory();
            delete mock[fieldName];
            result = trainer.validate(mock);
            assert.equal(result, false, 'missing ' + fieldName);
        }
    });
    it('should not allow whitespace in some fields', function () {
        var fields = ['username', 'firstName', 'lastName'],
            mock;
        fields.forEach(function (fieldName) {
            mock = trainerFactory();
            mock[fieldName] = 'with space';
            assert.equal(trainer.validate(mock), false);
        });
        // emails are different.
        mock = trainerFactory();
        mock.email = 'invalid @email.com';
        assert.equal(trainer.validate(mock), false);
    });
    it('should validate emails', function () {
        var mock,
            validEmails = [
                'valid@email.com',
                'valid.e_mail@their-host.com',
                'hr@foo.fr'
            ],
            invalidEmails = [
                'invalid.email@com',
                'invalid.email',
                'invalid@email',
                ''
            ];
        validEmails.forEach(function (validEmail) {
            mock = trainerFactory();
            mock.email = validEmail;
            assert.equal(trainer.validate(mock), true);
        });
        invalidEmails.forEach(function (invalidEmail) {
            mock = trainerFactory();
            mock.email = invalidEmail;
            assert.equal(trainer.validate(mock), false);
        });
    });
    it('should validate usernames', function () {
        var mock,
            validNames = [
                'joaquim',
                'jo.a-qui_m',
                'DirtDude127'
            ],
            invalidNames = [
                'an@sign'
            ];
        validNames.forEach(function (validName) {
            mock = trainerFactory();
            mock.username = validName;
            assert.equal(trainer.validate(mock), true, validName + ' should be valid');
        });
        invalidNames.forEach(function (invalidName) {
            mock = trainerFactory();
            mock.username = invalidName;
            assert.equal(trainer.validate(mock), false, invalidName + ' should be invalid');

        });
    });
    it('should validate firstName and lastName', function () {
        var mock,
            validNames = [
                'joaquim',
                'jo.a-qui_m',
                'DirtDude127'
            ],
            invalidNames = [
                ''
            ];
        validNames.forEach(function (validName) {
            mock = trainerFactory();
            mock.firstName = validName;
            assert.equal(trainer.validate(mock), true, validName + ' should be valid as a first name');
        });
        validNames.forEach(function (validName) {
            mock = trainerFactory();
            mock.lastName = validName;
            assert.equal(trainer.validate(mock), true, validName + ' should be valid as a last namr');
        });
        invalidNames.forEach(function (invalidName) {
            mock = trainerFactory();
            mock.firstName = invalidName;
            assert.equal(trainer.validate(mock), false, invalidName + ' should be invalid as first name');
        });
        invalidNames.forEach(function (invalidName) {
            mock = trainerFactory();
            mock.lastName = invalidName;
            assert.equal(trainer.validate(mock), false, invalidName + ' should be invalid as last name');

        });
    });
});
