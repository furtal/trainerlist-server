'use strict';

var assert = require('assert'),
    Trainer = require('../models/trainer.js').Trainer;

function trainerFactory(fields) {
    var trainer = new Trainer();
    fields = fields || {};
    trainer.email = fields.email || 'a.valid@email.com';
    trainer.username = fields.username || 'valid.username';
    trainer.firstName = fields.firstName || 'First';
    trainer.lastName = fields.lastName || 'Last';
    return trainer;
}

describe('Trainer model', function () {
    it('[testing trainerFactory defaults]', function () {
        var trainer = trainerFactory();
        assert.equal(trainer.validate(), true);
    });
    it('should validate missing fields', function () {
        var fields = ['email', 'username', 'firstName', 'lastName'],
            trainer,
            fieldName,
            result,
            i;
        for (i = 0; i < fields.length; i += 1) {
            fieldName = fields[i];
            trainer = trainerFactory();
            delete trainer[fieldName];
            result = trainer.validate();
            assert.equal(result, false, 'missing ' + fieldName);
        }
    });
    it('should not allow whitespace in some fields', function () {
        var fields = ['username', 'firstName', 'lastName'],
            trainer;
        fields.forEach(function (fieldName) {
            trainer = trainerFactory();
            trainer[fieldName] = 'with space';
            assert.equal(trainer.validate(), false);
        });
        // emails are different.
        trainer = trainerFactory();
        trainer.email = 'invalid @email.com';
        assert.equal(trainer.validate(), false);
    });
    it('should validate emails', function () {
        var trainer,
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
            trainer = trainerFactory();
            trainer.email = validEmail;
            assert.equal(trainer.validate(), true);
        });
        invalidEmails.forEach(function (invalidEmail) {
            trainer = trainerFactory();
            trainer.email = invalidEmail;
            assert.equal(trainer.validate(), false);
        });
    });
    it('should validate usernames', function () {
        var trainer,
            validNames = [
                'joaquim',
                'jo.a-qui_m',
                'DirtDude127'
            ],
            invalidNames = [
                'an@sign'
            ];
        validNames.forEach(function (validName) {
            trainer = trainerFactory();
            trainer.username = validName;
            assert.equal(trainer.validate(), true, validName + ' should be valid');
        });
        invalidNames.forEach(function (invalidName) {
            trainer = trainerFactory();
            trainer.username = invalidName;
            assert.equal(trainer.validate(), false, invalidName + ' should be invalid');

        });
    });
    it('should validate firstName and lastName', function () {
        var trainer,
            validNames = [
                'joaquim',
                'jo.a-qui_m',
                'DirtDude127'
            ],
            invalidNames = [
                ''
            ];
        validNames.forEach(function (validName) {
            trainer = trainerFactory();
            trainer.firstName = validName;
            assert.equal(trainer.validate(), true, validName + ' should be valid as a first name');
        });
        validNames.forEach(function (validName) {
            trainer = trainerFactory();
            trainer.lastName = validName;
            assert.equal(trainer.validate(), true, validName + ' should be valid as a last namr');
        });
        invalidNames.forEach(function (invalidName) {
            trainer = trainerFactory();
            trainer.firstName = invalidName;
            assert.equal(trainer.validate(), false, invalidName + ' should be invalid as first name');
        });
        invalidNames.forEach(function (invalidName) {
            trainer = trainerFactory();
            trainer.lastName = invalidName;
            assert.equal(trainer.validate(), false, invalidName + ' should be invalid as last name');

        });
    });
});
