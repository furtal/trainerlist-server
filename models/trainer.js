'use strict';
var Model = require('./model.js').Model;

function Trainer(initialData) {
    Model.call(this, initialData); // call the superclass.
}

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

Trainer.prototype.all = function (next) {
    var client = this.getClient(),
        that = this;
    client.get('/_design/trainer/_views/all', function (err, res, data) {
        if (err) {
            return next(err);
        }
        console.log(data)
        return next(data);
    })
}

Trainer.prototype.pAll = function () {
    return Q.nfcall(this.all.bind(this))
}

module.exports.Trainer = Trainer;
