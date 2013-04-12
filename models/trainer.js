'use strict';
var Model = require('./model.js').Model;

function Trainer() {}

Trainer.prototype = new Model();

// Do some regex to validate all the fields.
// Also make sure the required ones are there.
Trainer.prototype.validate = function () {
    var isValid,
        validateAName,
        email = this.email,
        username = this.username,
        firstName = this.firstName,
        lastName = this.lastName;

    // Email
    isValid = !!email &&
        !email.match(/\s/) && // no whitespace
        email.match(/^.+@.+\..+$/) && // Has an @ sign and a dot.
        email.length < 255;

    if (!isValid) {
        return false;
    }

    // Username
    isValid = !!username &&
        !username.match(/\s/) && // no whitespace
        !username.match(/@/) && // no at signs! this is how we tell if it's an username or an email
        username.match(/^[\w\.-_]/) && // just letters, dashes and underscores
        username.length < 128;

    if (!isValid) {
        return false;
    }

    // firstName and lastName
    validateAName = function (name) {
        return !!name &&
            !name.match(/\s/) && // no whitespace
            name.length < 128;
    };

    isValid = validateAName(firstName) && validateAName(lastName);

    return isValid;
};

module.exports.Trainer = Trainer;
